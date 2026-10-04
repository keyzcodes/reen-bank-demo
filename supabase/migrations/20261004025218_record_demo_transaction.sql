-- DEMO MONEY MOVEMENT:
-- Validate and save on the database before the frontend shows success.
-- The supplied transaction ID also prevents duplicate saves on retries.
create or replace function public.record_demo_transaction(
  p_id uuid,
  p_account_id text,
  p_kind text,
  p_amount_kobo bigint,
  p_counterparty text,
  p_payment_method text default null,
  p_recipient_account_number text default null,
  p_recipient_bank text default null
)
returns public.demo_transactions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_balance numeric;
  v_transaction public.demo_transactions;
begin
  if v_user_id is null then
    raise exception 'Please log in.';
  end if;

  if p_id is null then
    raise exception 'A transaction ID is required.';
  end if;

  if p_kind is null or p_kind not in ('deposit', 'withdrawal') then
    raise exception 'Invalid transaction type.';
  end if;

  if p_amount_kobo is null
     or p_amount_kobo <= 0
     or p_amount_kobo > 9007199254740991 then
    raise exception 'Enter a valid amount.';
  end if;

  if p_counterparty is null
     or char_length(trim(p_counterparty)) not between 1 and 120 then
    raise exception 'Enter a valid transaction name.';
  end if;

  -- ACCOUNT LOCK:
  -- Requests for this account wait their turn.
  -- A second withdrawal then checks the updated balance.
  perform 1
  from public.demo_accounts
  where user_id = v_user_id and id = p_account_id
  for update;

  if not found then
    raise exception 'The selected account is unavailable.';
  end if;

  -- RETRY PROTECTION:
  -- Return an existing matching transaction instead of charging twice.
  select * into v_transaction
  from public.demo_transactions
  where id = p_id;

  if found then
    if v_transaction.user_id <> v_user_id
       or v_transaction.account_id <> p_account_id
       or v_transaction.kind <> p_kind
       or v_transaction.amount_kobo <> p_amount_kobo
       or v_transaction.counterparty <> trim(p_counterparty)
       or v_transaction.payment_method is distinct from p_payment_method
       or v_transaction.recipient_account_number
          is distinct from p_recipient_account_number
       or v_transaction.recipient_bank is distinct from p_recipient_bank then
      raise exception 'Transaction ID already used for another action.';
    end if;

    return v_transaction;
  end if;

  select coalesce(sum(
    case when kind = 'deposit' then amount_kobo else -amount_kobo end
  ), 0)
  into v_balance
  from public.demo_transactions
  where user_id = v_user_id
    and account_id = p_account_id
    and status = 'completed';

  if p_kind = 'withdrawal' and p_amount_kobo > v_balance then
    raise exception 'Insufficient balance.';
  end if;

  if p_kind = 'deposit'
     and v_balance + p_amount_kobo > 9007199254740991 then
    raise exception 'The account balance exceeds the supported limit.';
  end if;

  insert into public.demo_transactions (
    id, user_id, account_id, kind, amount_kobo, counterparty,
    payment_method, recipient_account_number, recipient_bank
  )
  values (
    p_id, v_user_id, p_account_id, p_kind, p_amount_kobo,
    trim(p_counterparty), p_payment_method,
    p_recipient_account_number, p_recipient_bank
  )
  returning * into v_transaction;

  return v_transaction;
end;
$$;

-- FUNCTION ACCESS:
-- Only logged-in users may call it.
-- Ownership checks inside the function restrict the target account.
revoke all on function public.record_demo_transaction(
  uuid, text, text, bigint, text, text, text, text
) from public, anon;

grant execute on function public.record_demo_transaction(
  uuid, text, text, bigint, text, text, text, text
) to authenticated;