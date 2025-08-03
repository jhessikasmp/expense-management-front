import { ApiResponse } from './api.types';
import { User } from '../types/user.types';
import { api } from './api';

interface SalaryUpdateResponse extends ApiResponse {
  data: User;
}

export const salaryService = {
  update: (userId: string, amount: number, currency: string = 'USD') => 
    api.put<SalaryUpdateResponse>(`/users/${userId}/salary`, { salary: amount, currency }),

  delete: (userId: string) =>
    api.delete<SalaryUpdateResponse>(`/users/${userId}/salary`)
};
