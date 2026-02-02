import apiClient from './client';
import type { AxiosProgressEvent } from 'axios';
import type { ApiTransaction, BuyerData, SellerData } from '../types/transactions';

type SearchParams = {
  search?: string;
  status?: string;
};

type CreateTransactionPayload = {
  amount: number;
  itemDescription: string;
  sellerEmail?: string;
  buyerEmail?: string;
};

export const getBuyerData = async (params: SearchParams): Promise<BuyerData> => {
  const { data } = await apiClient.get<BuyerData>('/api/transactions/buyer-data', { params });
  return data;
};

export const getSellerData = async (params: SearchParams): Promise<SellerData> => {
  const { data } = await apiClient.get<SellerData>('/api/transactions/seller-data', { params });
  return data;
};

export const getTransaction = async (transactionId: string): Promise<ApiTransaction & { client_secret?: string | null }> => {
  const { data } = await apiClient.get<ApiTransaction & { client_secret?: string | null }>(`/api/transactions/${transactionId}`);
  return data;
};

export const createTransaction = async (payload: CreateTransactionPayload): Promise<{ transactionId?: string }> => {
  const { data } = await apiClient.post<{ transactionId?: string }>('/api/transactions', payload);
  return data;
};

export const cancelTransaction = async (transactionId: string) => {
  const { data } = await apiClient.post(`/api/transactions/${transactionId}/cancel`);
  return data;
};

export const payTransaction = async (transactionId: string) => {
  const { data } = await apiClient.post(`/api/transactions/${transactionId}/pay`);
  return data;
};

export const uploadTransactionFile = async (
  transactionId: string,
  file: File,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post(`/api/transactions/${transactionId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return data;
};

export const downloadTransactionFile = async (transactionId: string, fileType: 'buyer' | 'seller') => {
  const url =
    fileType === 'buyer' ? `/api/transactions/${transactionId}/download?file=buyer` : `/api/transactions/${transactionId}/download`;
  return apiClient.get(url, { responseType: 'blob' });
};
