import { FundEntry, Investment, MonthlyContribution } from '../types';

const KEYS = {
  EMERGENCY_FUND: 'emergency_fund',
  CAR_FUND: 'car_fund',
  TRAVEL_FUND: 'travel_fund',
  INVESTMENTS: 'investments',
  MONTHLY_CONTRIBUTIONS: 'monthly_contributions'
};

export const localStorageService = {
  // Generic get and set methods
  getItem: <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  setItem: <T>(key: string, value: T[]): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // Fund specific methods
  getFundEntries: (fundType: 'emergency' | 'car' | 'travel', userId?: string): FundEntry[] => {
    const entries = localStorageService.getItem<FundEntry>(
      fundType === 'emergency' ? KEYS.EMERGENCY_FUND :
      fundType === 'car' ? KEYS.CAR_FUND :
      KEYS.TRAVEL_FUND
    );
    return userId ? entries.filter(entry => entry.userId === userId) : entries;
  },

  saveFundEntry: (entry: FundEntry, fundType: 'emergency' | 'car' | 'travel'): void => {
    const key = fundType === 'emergency' ? KEYS.EMERGENCY_FUND :
                fundType === 'car' ? KEYS.CAR_FUND :
                KEYS.TRAVEL_FUND;
    const entries = localStorageService.getItem<FundEntry>(key);
    entries.push({ ...entry, _id: Date.now().toString() });
    localStorageService.setItem(key, entries);
  },

  // Investment methods
  getInvestments: (userId?: string): Investment[] => {
    const investments = localStorageService.getItem<Investment>(KEYS.INVESTMENTS);
    return userId ? investments.filter(inv => inv.userId === userId) : investments;
  },

  saveInvestment: (investment: Investment): void => {
    const investments = localStorageService.getItem<Investment>(KEYS.INVESTMENTS);
    investments.push({ ...investment, _id: Date.now().toString() });
    localStorageService.setItem(KEYS.INVESTMENTS, investments);
  },

  // Monthly contributions methods
  getMonthlyContributions: (fundId: string, userId?: string): MonthlyContribution[] => {
    const contributions = localStorageService.getItem<MonthlyContribution>(KEYS.MONTHLY_CONTRIBUTIONS);
    return contributions.filter(c => 
      c.fundId === fundId && (!userId || c.userId === userId)
    );
  },

  saveMonthlyContribution: (contribution: MonthlyContribution): void => {
    const contributions = localStorageService.getItem<MonthlyContribution>(KEYS.MONTHLY_CONTRIBUTIONS);
    contributions.push({ ...contribution, _id: Date.now().toString() });
    localStorageService.setItem(KEYS.MONTHLY_CONTRIBUTIONS, contributions);
  },

  updateMonthlyContribution: (id: string, updates: Partial<MonthlyContribution>): void => {
    const contributions = localStorageService.getItem<MonthlyContribution>(KEYS.MONTHLY_CONTRIBUTIONS);
    const index = contributions.findIndex(c => c._id === id);
    if (index !== -1) {
      contributions[index] = { ...contributions[index], ...updates };
      localStorageService.setItem(KEYS.MONTHLY_CONTRIBUTIONS, contributions);
    }
  }
};