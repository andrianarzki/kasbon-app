export type DebtType = 'owed_to_me' | 'i_owe';

export interface Debt {
  id: string;
  user_id: string;
  type: DebtType;
  counterpart_name: string;
  amount: number;
  note: string | null;
  due_date: string | null;
  settled_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DebtInsert = {
  type: DebtType;
  counterpart_name: string;
  amount: number;
  note?: string | null;
  due_date?: string | null;
  settled_at?: string | null;
};

export type DebtUpdate = Partial<DebtInsert>;

export interface DebtSummary {
  totalOwedToMe: number;
  totalIOwe: number;
  netBalance: number;
  countOwedToMe: number;
  countIOwe: number;
  countSettled: number;
}

export type FilterStatus = 'all' | 'unsettled' | 'settled';
export type FilterType = 'all' | 'owed_to_me' | 'i_owe';
export type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export interface GroupedDebt {
  counterpart_name: string;
  totalAmount: number;
  netAmount: number; // positive = they owe me, negative = I owe them
  count: number;
  debts: Debt[];
}
