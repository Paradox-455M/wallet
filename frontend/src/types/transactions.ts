export type ApiTransaction = {
  id: string;
  amount: number | string;
  item_description: string;
  buyer_email: string;
  seller_email: string;
  status: string;
  payment_received?: boolean;
  file_uploaded?: boolean;
  file_name?: string | null;
  buyer_file_uploaded?: boolean;
  buyer_file_name?: string | null;
  stripe_payment_intent_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  completed_at?: string | null;
};

export type BuyerStats = {
  totalTransactions?: number;
  pendingFiles?: number;
  completedTransactions?: number;
  totalSpent?: number;
};

export type SellerStats = {
  totalUploads?: number;
  totalEarned?: number;
  pendingPayouts?: number;
  downloadsCompleted?: number;
};

export type BuyerData = {
  transactions: ApiTransaction[];
  statistics?: BuyerStats;
};

export type SellerData = {
  transactions: ApiTransaction[];
  statistics?: SellerStats;
};
