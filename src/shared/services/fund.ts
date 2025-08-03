import { FundEntry } from '../types/core.types';
import { ApiResponse } from './api.types';
import { api } from './api';

interface FundListResponse extends ApiResponse {
  data: FundEntry[];
}

interface FundCreateResponse extends ApiResponse {
  data: FundEntry;
}

interface FundUpdateResponse extends ApiResponse {
  data: FundEntry;
}

interface FundDeleteResponse extends ApiResponse {
  data: { id: string; };
}

export const fundService = {
  create: (fund: Partial<FundEntry>) =>
    api.post<FundCreateResponse>('/funds', fund),

  list: (userId?: string, type?: string) =>
    api.get<FundListResponse>('/funds', { params: { userId, type } }),

  update: (id: string, fund: Partial<FundEntry>) =>
    api.put<FundUpdateResponse>(`/funds/${id}`, fund),

  delete: (id: string) =>
    api.delete<FundDeleteResponse>(`/funds/${id}`),

  getBalance: (id: string) =>
    api.get<FundUpdateResponse>(`/funds/${id}/balance`)
};
