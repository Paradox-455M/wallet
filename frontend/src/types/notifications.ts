export type NotificationItem = {
  id: string;
  title: string;
  message?: string | null;
  transaction_id?: string | null;
  created_at?: string | null;
  read_at?: string | null;
};
