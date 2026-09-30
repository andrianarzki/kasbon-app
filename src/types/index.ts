export type TransactionType = 'piutang' | 'utang'; // 'piutang' = Dihutang ke Saya, 'utang' = Saya Hutang
export type TransactionStatus = 'pending' | 'settled';

export interface KasbonTransaction {
  id: string;
  user_id: string;
  contact_name: string;
  contact_phone?: string;
  type: TransactionType;
  amount: number;
  transaction_date: string; // ISO date YYYY-MM-DD
  due_date: string; // ISO date YYYY-MM-DD
  status: TransactionStatus;
  settled_at?: string; // ISO date-time or formatted date
  notes?: string;
  payment_method?: string; // e.g., 'Transfer BCA', 'QRIS', 'Tunai', 'Gopay'
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  plan: 'Personal Free' | 'Pro Komunitas';
}

export interface KasbonStats {
  netBalance: number;
  totalPiutang: number;
  totalUtang: number;
  pendingPiutangCount: number;
  pendingUtangCount: number;
  totalSettledAmount: number;
  settledCount: number;
  settlementRate: number; // percentage
  avgDaysToSettle: number;
  mostDisciplinedContact?: {
    name: string;
    settledCount: number;
  };
}
