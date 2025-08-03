import type { User } from '../types/user.types';
import { Expense, Investment, TravelFund, MonthlySalary } from '../../types';

// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Auth Responses
export interface LoginResponse extends ApiResponse<User> {}
export interface RegisterResponse extends ApiResponse<User> {}

// Expense Responses
export interface ExpenseListResponse extends ApiResponse<Expense[]> {}
export interface ExpenseCreateResponse extends ApiResponse<Expense> {}
export interface ExpenseUpdateResponse extends ApiResponse<Expense> {}
export interface ExpenseDeleteResponse extends ApiResponse<{ id: string }> {}

// Investment Responses
export interface InvestmentListResponse extends ApiResponse<Investment[]> {}
export interface InvestmentCreateResponse extends ApiResponse<Investment> {}
export interface InvestmentUpdateResponse extends ApiResponse<Investment> {}
export interface InvestmentDeleteResponse extends ApiResponse<{ id: string }> {}

// Travel Fund Responses
export interface TravelFundListResponse extends ApiResponse<TravelFund[]> {}
export interface TravelFundCreateResponse extends ApiResponse<TravelFund> {}
export interface TravelFundUpdateResponse extends ApiResponse<TravelFund> {}
export interface TravelFundDeleteResponse extends ApiResponse<{ id: string }> {}

// Monthly Salary Responses
export interface SalaryListResponse extends ApiResponse<MonthlySalary[]> {}
export interface SalaryCreateResponse extends ApiResponse<MonthlySalary> {}
export interface SalaryUpdateResponse extends ApiResponse<MonthlySalary> {}
export interface SalaryDeleteResponse extends ApiResponse<{ id: string }> {}

// Error Response
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}
