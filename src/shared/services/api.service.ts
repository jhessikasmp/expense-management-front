import axios, { AxiosResponse } from 'axios';
import type { User } from '@shared/types/user.types';
import type { Expense, Investment } from '@shared/types/core.types';
import type {
  ApiResponse,
  ApiErrorResponse,
  RegisterResponse,
  // Response Types
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
  MonthlyContributionListResponse,
  MonthlyContributionCreateResponse,
  MonthlyContributionUpdateResponse,
  MonthlyContributionDeleteResponse,
  // DTO Types
  CreateUserDTO,
  UpdateUserDTO,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  CreateInvestmentDTO,
  UpdateInvestmentDTO,
  CreateSalaryDTO,
  CreateTravelFundDTO,
  CreateMonthlyContributionDTO,
  UpdateMonthlyContributionDTO
} from '../types/api.types';

const API_BASE_URL = 'https://expense-management-back.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to standardize API responses
api.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    // Pass through the original response but add success flag
    return {
      ...response,
      data: {
        success: true,
        data: response.data
      }
    };
  },
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
  create: (fund: CreateTravelFundDTO) => 
    api.post<TravelFundCreateResponse>('/travel-funds', fund),
  list: (userId?: string) => 
    api.get<TravelFundListResponse>('/travel-funds', { params: { userId } }),
};

export const monthlyContributionService = {
  create: (contribution: CreateMonthlyContributionDTO) => 
    api.post<MonthlyContributionCreateResponse>('/monthly-contributions', contribution),
  
  list: (userId?: string, fundId?: string) => 
    api.get<MonthlyContributionListResponse>('/monthly-contributions', { 
      params: { userId, fundId } 
    }),
  
  update: (id: string, contribution: UpdateMonthlyContributionDTO) => 
    api.put<MonthlyContributionUpdateResponse>(`/monthly-contributions/${id}`, contribution),
  
  delete: (id: string) => 
    api.delete<MonthlyContributionDeleteResponse>(`/monthly-contributions/${id}`),
  
  getActive: (userId?: string) => 
    api.get<MonthlyContributionListResponse>('/monthly-contributions/active', {
      params: { userId }
    }),
};
