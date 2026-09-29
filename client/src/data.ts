export type AccountId = "main" | "school" | "holiday";

export interface Account {
  id: AccountId;
  label: string;
  balance: string;
  balanceRaw: number;
  number: string;
  income: string;
  expense: string;
  incomePct: number;
  expensePct: number;
}

export interface Transaction {
  id: string;
  account: AccountId;
  name: string;
  date: string;
  amount: string;
  amountRaw: number;
  type: "credit" | "debit";
}

export const accounts: Account[] = [
  {
    id: "main",
    label: "Main Account",
    balance: "₦ 44,500.00",
    balanceRaw: 44500,
    number: "0012 3456 7890",
    income: "₦ 54,500.00",
    expense: "₦ 10,000.00",
    incomePct: 79,
    expensePct: 65,
  },
  {
    id: "school",
    label: "School Savings",
    balance: "₦ 22,800.00",
    balanceRaw: 22800,
    number: "0098 7654 3210",
    income: "₦ 30,000.00",
    expense: "₦ 7,200.00",
    incomePct: 60,
    expensePct: 45,
  },
  {
    id: "holiday",
    label: "Holiday Plan",
    balance: "₦ 18,200.00",
    balanceRaw: 18200,
    number: "0055 4433 2211",
    income: "₦ 20,000.00",
    expense: "₦ 1,800.00",
    incomePct: 40,
    expensePct: 18,
  },
];

export const allTransactions: Transaction[] = [
  // Main Account
  { id: "t1",  account: "main",   name: "Oluwaben Jamin",  date: "06.Mar.2023 - 09:39", amount: "- 10,000.00", amountRaw: -10000, type: "debit"  },
  { id: "t2",  account: "main",   name: "Chisom Adeyemi",  date: "06.Mar.2023 - 09:39", amount: "+10,000.00",  amountRaw:  10000, type: "credit" },
  { id: "t3",  account: "main",   name: "Emeka Okafor",    date: "05.Mar.2023 - 14:22", amount: "- 5,000.00",  amountRaw:  -5000, type: "debit"  },
  { id: "t4",  account: "main",   name: "Fatima Hassan",   date: "05.Mar.2023 - 11:10", amount: "+15,000.00",  amountRaw:  15000, type: "credit" },
  { id: "t5",  account: "main",   name: "Oluwaben Jamin",  date: "04.Mar.2023 - 08:45", amount: "- 2,500.00",  amountRaw:  -2500, type: "debit"  },
  { id: "t6",  account: "main",   name: "Amara Nwosu",     date: "04.Mar.2023 - 07:30", amount: "+8,000.00",   amountRaw:   8000, type: "credit" },
  { id: "t7",  account: "main",   name: "Babatunde Ojo",   date: "03.Mar.2023 - 16:55", amount: "- 12,000.00", amountRaw: -12000, type: "debit"  },
  { id: "t8",  account: "main",   name: "Zainab Musa",     date: "03.Mar.2023 - 09:15", amount: "+9,500.00",   amountRaw:   9500, type: "credit" },
  // School Savings
  { id: "t9",  account: "school", name: "School Fees",     date: "06.Mar.2023 - 12:00", amount: "- 15,000.00", amountRaw: -15000, type: "debit"  },
  { id: "t10", account: "school", name: "Bursary Credit",  date: "05.Mar.2023 - 09:30", amount: "+20,000.00",  amountRaw:  20000, type: "credit" },
  { id: "t11", account: "school", name: "Books & Supplies",date: "04.Mar.2023 - 15:45", amount: "- 3,500.00",  amountRaw:  -3500, type: "debit"  },
  { id: "t12", account: "school", name: "Scholarship Fund",date: "03.Mar.2023 - 10:00", amount: "+10,000.00",  amountRaw:  10000, type: "credit" },
  { id: "t13", account: "school", name: "Exam Registration",date:"02.Mar.2023 - 11:20", amount: "- 2,700.00",  amountRaw:  -2700, type: "debit"  },
  // Holiday Plan
  { id: "t14", account: "holiday",name: "Flight Booking",  date: "06.Mar.2023 - 18:00", amount: "- 1,800.00",  amountRaw:  -1800, type: "debit"  },
  { id: "t15", account: "holiday",name: "Holiday Savings", date: "05.Mar.2023 - 09:00", amount: "+10,000.00",  amountRaw:  10000, type: "credit" },
  { id: "t16", account: "holiday",name: "Hotel Deposit",   date: "04.Mar.2023 - 14:00", amount: "- 5,000.00",  amountRaw:  -5000, type: "debit"  },
  { id: "t17", account: "holiday",name: "Refund - Tour",   date: "03.Mar.2023 - 16:30", amount: "+5,000.00",   amountRaw:   5000, type: "credit" },
];
