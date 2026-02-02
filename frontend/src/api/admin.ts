import apiClient from './client';
import type { ApiTransaction } from '../types/transactions';

export const getAdminTransactions = async (status?: string): Promise<ApiTransaction[]> => {
  const params = status ? { status } : {};
  const { data } = await apiClient.get<{ transactions?: ApiTransaction[] }>('/api/admin/transactions', { params });
  return data.transactions || [];
};

export const cancelAdminTransaction = async (transactionId: string) => {
  const { data } = await apiClient.post(`/api/admin/transactions/${transactionId}/cancel`);
  return data;
};

export const refundTransaction = async (transactionId: string) => {
  const { data } = await apiClient.post(`/api/transactions/${transactionId}/refund`);
  return data;
};
