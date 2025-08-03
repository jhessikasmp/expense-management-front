import { FundContribution } from '@shared/types/fund.types';
import { api } from '@shared/services/api';

export const fundContributionService = {
  create: async (contribution: {
    fundId: string;
    userId: string;
    amount: number;
    date: string;
    fundType: 'travel' | 'emergency' | 'car';
  }) => {
    return api.post<{ data: FundContribution }>('/fund-contributions', contribution);
  },

  list: async (fundId: string) => {
    return api.get<{ data: FundContribution[] }>(`/fund-contributions/${fundId}`);
  },

  delete: async (id: string) => {
    return api.delete(`/fund-contributions/${id}`);
  },
};
