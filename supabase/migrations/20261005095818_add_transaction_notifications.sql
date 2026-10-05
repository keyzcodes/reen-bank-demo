-- NOTIFICATIONS:
-- One notification per saved transaction.
-- Store structured data; the frontend formats the amount and message.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null unique
    references public.demo_transactions(id) on delete cascade,
  account_label text not null,
  kind text not null check (kind in ('deposit', 'withdrawal')),
  amount_kobo bigint not null check (amount_kobo > 0),
  counterparty text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index notifications_user_date_idx
  on public.notifications (user_id, created_at desc);

-- PRIVACY:
-- Users can read only their own notifications.
-- They can update read_at, but cannot rewrite messages or create alerts.
alter table public.notifications enable row level security;

create policy notifications_read
  on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));

create policy notifications_mark_read
  on public.notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.notifications from public, anon, authenticated;

grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- AUTOMATIC ALERT:
-- Runs after a completed transaction is inserted.
-- If the transaction rolls back, this notification rolls back too.
create function public.notify_demo_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'completed' then
    insert into public.notifications (
      user_id, transaction_id, account_label,
      kind, amount_kobo, counterparty, created_at
    )
    select
      new.user_id, new.id, account.label,
      new.kind, new.amount_kobo, new.counterparty, new.created_at
    from public.demo_accounts as account
    where account.user_id = new.user_id
      and account.id = new.account_id
    on conflict (transaction_id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.notify_demo_transaction()
  from public, anon, authenticated;

create trigger demo_transaction_notification
after insert on public.demo_transactions
for each row execute function public.notify_demo_transaction();

-- EXISTING HISTORY:
-- Give existing completed transactions a notification as well.
-- These begin unread and retain their original transaction dates.
insert into public.notifications (
  user_id, transaction_id, account_label,
  kind, amount_kobo, counterparty, created_at
)
select
  transaction.user_id,
  transaction.id,
  account.label,
  transaction.kind,
  transaction.amount_kobo,
  transaction.counterparty,
  transaction.created_at
from public.demo_transactions as transaction
join public.demo_accounts as account
  on account.user_id = transaction.user_id
  and account.id = transaction.account_id
where transaction.status = 'completed'
on conflict (transaction_id) do nothing;