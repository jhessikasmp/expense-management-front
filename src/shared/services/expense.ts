import { Expense } from '../types/core.types';
import { ApiResponse } from './api.types';
import { api } from './api';

interface ExpenseListResponse extends ApiResponse {
  data: Expense[];
}

interface ExpenseCreateResponse extends ApiResponse {
  data: Expense;
}

interface ExpenseUpdateResponse extends ApiResponse {
  data: Expense;
}

interface ExpenseDeleteResponse extends ApiResponse {
  data: { id: string; };
}

export const expenseService = {
  create: (expense: Partial<Expense>) =>
    api.post<ExpenseCreateResponse>('/expenses', expense),

  list: (userId?: string) =>
    api.get<ExpenseListResponse>('/expenses', { params: { userId } }),

  update: (id: string, expense: Partial<Expense>) =>
    api.put<ExpenseUpdateResponse>(`/expenses/${id}`, expense),

  delete: (id: string) =>
    api.delete<ExpenseDeleteResponse>(`/expenses/${id}`)
};
