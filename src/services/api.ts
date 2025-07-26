import axios from 'axios';
import { User, Expense, Investment, TravelFund } from '../types';

const API_BASE_URL = 'https://expense-management-back.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userService = {
  create: (user: Omit<User, '_id' | 'createdAt'>) => api.post<User>('/users', user),
  list: () => api.get<User[]>('/users'),
  update: (id: string, user: Partial<User>) => api.put<User>(`/users/${id}`, user),
};

export const expenseService = {
  create: (expense: Omit<Expense, '_id' | 'createdAt'>) => api.post<Expense>('/expenses', expense),
  list: (userId?: string) => api.get<Expense[]>('/expenses', { params: { userId } }),
  getById: (id: string) => api.get<Expense>(`/expenses/${id}`),
  update: (id: string, expense: Partial<Expense>) => api.put<Expense>(`/expenses/${id}`, expense),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

export const investmentService = {
  create: (investment: Omit<Investment, '_id' | 'createdAt'>) => api.post<Investment>('/investments', investment),
  list: (userId?: string) => api.get<Investment[]>('/investments', { params: { userId } }),
  getById: (id: string) => api.get<Investment>(`/investments/${id}`),
  update: (id: string, investment: Partial<Investment>) => api.put<Investment>(`/investments/${id}`, investment),
  delete: (id: string) => api.delete(`/investments/${id}`),
};

export const travelFundService = {
  create: (fund: Omit<TravelFund, '_id' | 'createdAt'>) => api.post<TravelFund>('/travel-funds', fund),
  list: () => api.get<TravelFund[]>('/travel-funds'),
  getById: (id: string) => api.get<TravelFund>(`/travel-funds/${id}`),
  update: (id: string, fund: Partial<TravelFund>) => api.put<TravelFund>(`/travel-funds/${id}`, fund),
  delete: (id: string) => api.delete(`/travel-funds/${id}`),
};