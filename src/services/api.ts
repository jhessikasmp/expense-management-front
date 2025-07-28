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

export const salaryService = {
  add: (salary: { userId: string; amount: number; month: number; year: number }) => api.post('/salaries', salary),
  getAnnual: (year: number) => api.get(`/salaries/annual/${year}`),
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

export const fundService = {
  create: (fund: any) => api.post('/funds', fund),
  list: (userId?: string, category?: string) => api.get('/funds', { params: { userId, category } }),
  delete: (id: string) => api.delete(`/funds/${id}`),
};

// Serviço para obter preços de ativos financeiros
export const assetPriceService = {
  // Obter preço de criptomoedas usando CoinGecko API
  getCryptoPrice: async (coinId: string, currency = 'eur') => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${currency}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar preço da criptomoeda ${coinId}:`, error);
      throw error;
    }
  },
  
  // Obter preço de ações e ETFs usando Yahoo Finance API
  getStockPrice: async (symbol: string) => {
    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?region=US&lang=en-US&interval=1d`
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar preço da ação/ETF ${symbol}:`, error);
      throw error;
    }
  },
  
  // Lista de criptomoedas suportadas
  getSupportedCryptos: async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/list?include_platform=false'
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lista de criptomoedas:', error);
      throw error;
    }
  }
};