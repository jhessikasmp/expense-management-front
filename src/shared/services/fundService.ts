import type { FundEntry } from '@shared/types/core.types';
import { localStorageService } from '@shared/services/localStorageService';

export const fundService = {
  create: async (entry: FundEntry) => {
    try {
      const rawEntries = localStorageService.getItem<FundEntry[] | FundEntry[][]>(`fund_${entry.category}`) || [];
      const entries: FundEntry[] = Array.isArray(rawEntries[0]) ? (rawEntries as FundEntry[][]).flat() : (rawEntries as unknown as FundEntry[]);
      const newEntry: FundEntry = {
        ...entry,
        _id: Math.random().toString(36).substring(7),
        createdAt: new Date()
      };
      entries.push(newEntry);
      localStorageService.setItem(`fund_${entry.category}`, entries);
      return { data: newEntry };
    } catch (error) {
      console.error('Error creating fund entry:', error);
      throw error;
    }
  },

  list: async (userId: string, category: string) => {
    try {
      const rawEntries = localStorageService.getItem<FundEntry[] | FundEntry[][]>(`fund_${category}`) || [];
      const entries: FundEntry[] = Array.isArray(rawEntries[0]) ? (rawEntries as FundEntry[][]).flat() : (rawEntries as unknown as FundEntry[]);
      return { 
        data: userId ? entries.filter(entry => entry.userId === userId) : entries 
      };
    } catch (error) {
      console.error('Error listing fund entries:', error);
      throw error;
    }
  }
};
