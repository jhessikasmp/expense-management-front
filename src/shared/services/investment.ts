import { Investment } from '../types/core.types';
import { ApiResponse } from './api.types';
import { api } from './api';

interface InvestmentListResponse extends ApiResponse {
  data: Investment[];
}

interface InvestmentCreateResponse extends ApiResponse {
  data: Investment;
}

interface InvestmentUpdateResponse extends ApiResponse {
  data: Investment;
}

interface InvestmentDeleteResponse extends ApiResponse {
  data: { id: string; };
}

export const investmentService = {
  create: (investment: Partial<Investment>) =>
    api.post<InvestmentCreateResponse>('/investments', investment),

  list: (userId?: string) =>
    api.get<InvestmentListResponse>('/investments', { params: { userId } }),

  update: (id: string, investment: Partial<Investment>) =>
    api.put<InvestmentUpdateResponse>(`/investments/${id}`, investment),

  delete: (id: string) =>
    api.delete<InvestmentDeleteResponse>(`/investments/${id}`),

  getBalance: (id: string) =>
    api.get<InvestmentUpdateResponse>(`/investments/${id}/balance`)
};
