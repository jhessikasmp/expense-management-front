import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../../types';
import { FundContribution } from '../../../types/fundContribution.types';
import { useTheme } from '../../../shared/components/ThemeProvider';
import { fundContributionService } from '../../../services/fundContributionService';
import { FundContributionForm } from '../components/FundContributionForm';
import { FundContributionHistory } from '../components/FundContributionHistory';

interface TravelFund {
  _id?: string;
  userId: string;
  name: string;
  goal: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TravelFundPanelProps {
  currentUser: User;
  travelFund: TravelFund;
  availableBalance: number;
  onContributionAdded: () => void;
}


export const TravelFundPanel: React.FC<TravelFundPanelProps> = ({
  currentUser,
  travelFund,
  availableBalance,
  onContributionAdded
}) => {
  const [contributions, setContributions] = useState<FundContribution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();

  const fundId = travelFund._id;
  const userId = currentUser._id;

  if (!fundId || !userId) {
    throw new Error('Fund ID and User ID are required');
  }

  const loadContributions = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fundContributionService.list(fundId);
      const mappedContributions = response.data.data.map(c => ({
        ...c,
        fundType: 'travel' as const,
        date: new Date().toISOString(),
        createdAt: c.createdAt ? c.createdAt.toISOString() : undefined,
        updatedAt: c.updatedAt ? c.updatedAt.toISOString() : undefined
      }));
      setContributions(mappedContributions);
      setError(null);
    } catch (err: unknown) {
      console.error('Error loading contributions:', err);
      setError('Erro ao carregar contribuições');
    } finally {
      setIsLoading(false);
    }
  }, [fundId]);

  useEffect(() => {
    loadContributions();
  }, [loadContributions]);

  const handleContribute = async (amount: number, date: string): Promise<void> => {
    try {
      await fundContributionService.create({
        fundId,
        userId,
        amount,
        date,
        fundType: 'travel'
      });
      await loadContributions();
      onContributionAdded();
    } catch (err: unknown) {
      console.error('Error adding contribution:', err);
      throw err;
    }
  };

  const handleDeleteContribution = async (contributionId: string): Promise<void> => {
    try {
      await fundContributionService.delete(contributionId);
      await loadContributions();
      onContributionAdded();
    } catch (err: unknown) {
      console.error('Error deleting contribution:', err);
      setError('Erro ao excluir contribuição');
    }
  };

  const totalContributions = contributions.reduce((sum, c) => sum + (c.amount ?? 0), 0);
  const targetGoal = travelFund.goal ?? 0;

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Fundo de Viagem
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total no Fundo
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              €{totalContributions.toFixed(2)}
            </p>
          </div>
          <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Meta
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              €{targetGoal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FundContributionForm
            fundId={fundId}
            availableBalance={availableBalance}
            onContribute={handleContribute}
          />
        </div>

        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Histórico de Contribuições
          </h3>
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <FundContributionHistory
              contributions={contributions}
              onDelete={handleDeleteContribution}
            />
          )}
        </div>
      </div>
    </div>
  );
};
