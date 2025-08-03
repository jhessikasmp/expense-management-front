import { ApiResponse } from './api.types';
import { TravelFund } from '@shared/types/core.types';
import { api } from './api';

interface TravelFundCreateResponse extends ApiResponse {
  data: TravelFund;
}

interface TravelFundListResponse extends ApiResponse {
  data: TravelFund[];
}

interface TravelFundUpdateResponse extends ApiResponse {
  data: TravelFund;
}

interface TravelFundDeleteResponse extends ApiResponse {
  data: TravelFund;
}

export const travelFundService = {
  create: (fund: Partial<TravelFund>) =>
    api.post<TravelFundCreateResponse>('/travel-funds', fund),

  list: (userId?: string) =>
    api.get<TravelFundListResponse>('/travel-funds', { params: { userId } }),

  update: (id: string, fund: Partial<TravelFund>) =>
    api.put<TravelFundUpdateResponse>(`/travel-funds/${id}`, fund),

  delete: (id: string) =>
    api.delete<TravelFundDeleteResponse>(`/travel-funds/${id}`)
};
