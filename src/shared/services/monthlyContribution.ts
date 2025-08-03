import { MonthlyContribution } from '../types';
import { ApiResponse } from './api.types';

export interface MonthlyContributionListResponse extends ApiResponse<MonthlyContribution[]> {}
export interface MonthlyContributionCreateResponse extends ApiResponse<MonthlyContribution> {}
export interface MonthlyContributionUpdateResponse extends ApiResponse<MonthlyContribution> {}
export interface MonthlyContributionDeleteResponse extends ApiResponse<{ id: string }> {}

export type CreateMonthlyContributionDTO = Omit<MonthlyContribution, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateMonthlyContributionDTO = Partial<Omit<MonthlyContribution, '_id' | 'createdAt' | 'updatedAt'>>;

export const monthlyContributionService = {
  create: (contribution: CreateMonthlyContributionDTO) => 
    api.post<MonthlyContributionCreateResponse>('/monthly-contributions', contribution),
  
  list: (userId?: string, fundId?: string) => 
    api.get<MonthlyContributionListResponse>('/monthly-contributions', { 
      params: { userId, fundId } 
    }),
  
  update: (id: string, contribution: UpdateMonthlyContributionDTO) => 
    api.put<MonthlyContributionUpdateResponse>(`/monthly-contributions/${id}`, contribution),
  
  remove: (id: string) => 
    api.delete<MonthlyContributionDeleteResponse>(`/monthly-contributions/${id}`),
  
  getActive: (userId?: string) => 
    api.get<MonthlyContributionListResponse>('/monthly-contributions/active', {
      params: { userId }
    }),
};
