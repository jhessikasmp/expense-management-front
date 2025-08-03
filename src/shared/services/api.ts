import axios, { AxiosResponse } from 'axios';
import { User, Expense, Investment, TravelFund, MonthlySalary } from '../types';
import {
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  ExpenseListResponse,
  ExpenseCreateResponse,
  ExpenseUpdateResponse,
  ExpenseDeleteResponse,
  InvestmentListResponse,
  InvestmentCreateResponse,
  InvestmentUpdateResponse,
  InvestmentDeleteResponse,
  TravelFundListResponse,
  TravelFundCreateResponse,
  SalaryListResponse,
  SalaryCreateResponse,
  ApiErrorResponse
} from '../types/api';

const API_BASE_URL = 'https://expense-management-back.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to standardize API responses
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => response.data,
  (error) => {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: error.response?.data?.error || 'Unknown error occurred',
      message: error.response?.data?.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500
    };
    return Promise.reject(errorResponse);
  }
);

export type CreateUserDTO = Omit<User, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserDTO = Partial<Omit<User, '_id' | 'createdAt' | 'updatedAt'>>;
export type CreateExpenseDTO = Omit<Expense, '_id' | 'createdAt'>;
export type UpdateExpenseDTO = Partial<Omit<Expense, '_id' | 'createdAt'>>;
export type CreateInvestmentDTO = Omit<Investment, '_id' | 'createdAt'>;
export type UpdateInvestmentDTO = Partial<Omit<Investment, '_id' | 'createdAt'>>;
export type CreateSalaryDTO = {
  userId: string;
  amount: number;
  month: number;
  year: number;
  currency: string;
};

export const userService = {
  create: (user: CreateUserDTO) => 
    api.post<RegisterResponse>('/users', user),
  list: () => 
    api.get<ApiResponse<User[]>>('/users'),
  update: (id: string, user: UpdateUserDTO) => 
    api.put<ApiResponse<User>>(`/users/${id}`, user),
};

export const salaryService = {
  add: (salary: CreateSalaryDTO) => 
    api.post<SalaryCreateResponse>('/salaries', salary),
  getAnnual: (year: number) => 
    api.get<SalaryListResponse>(`/salaries/annual/${year}`),
};

export const expenseService = {
  create: (expense: CreateExpenseDTO) => 
    api.post<ExpenseCreateResponse>('/expenses', expense),
  list: (userId?: string) => 
    api.get<ExpenseListResponse>('/expenses', { params: { userId } }),
  getById: (id: string) => 
    api.get<ApiResponse<Expense>>(`/expenses/${id}`),
  update: (id: string, expense: UpdateExpenseDTO) => 
    api.put<ExpenseUpdateResponse>(`/expenses/${id}`, expense),
  delete: (id: string) => 
    api.delete<ExpenseDeleteResponse>(`/expenses/${id}`),
};

export const investmentService = {
  create: (investment: CreateInvestmentDTO) => 
    api.post<InvestmentCreateResponse>('/investments', investment),
  list: (userId?: string) => 
    api.get<InvestmentListResponse>('/investments', { params: { userId } }),
  getById: (id: string) => 
    api.get<ApiResponse<Investment>>(`/investments/${id}`),
  update: (id: string, investment: UpdateInvestmentDTO) => 
    api.put<InvestmentUpdateResponse>(`/investments/${id}`, investment),
  delete: (id: string) => 
    api.delete<InvestmentDeleteResponse>(`/investments/${id}`),
};

export const travelFundService = {
  create: (fund: Omit<TravelFund, '_id' | 'createdAt'>) => 
    api.post<TravelFundCreateResponse>('/travel-funds', fund),
  list: (userId?: string) => 
    api.get<TravelFundListResponse>('/travel-funds', { params: { userId } }),
};
  update: (id: string, contribution: Partial<MonthlyContribution>) => 
    api.put<MonthlyContribution>(`/monthly-contributions/${id}`, contribution),
  delete: (id: string) => api.delete(`/monthly-contributions/${id}`),
  getActive: (userId?: string) => 
    api.get<MonthlyContribution[]>('/monthly-contributions/active', { params: { userId } }),
};