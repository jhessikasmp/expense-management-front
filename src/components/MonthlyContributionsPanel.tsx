import React, { useEffect, useState, useCallback } from 'react';
import { MonthlyContribution } from '../../types';
import { useTheme } from '../../shared/hooks/useTheme';
import { localStorageService } from '../../services/localStorageService';
import MonthlyContributionForm from '../MonthlyContributionForm';
import { monthlyContributionService } from '../../services/api';

interface MonthlyContributionsPanelProps {
  userId: string;
  fundId: string;
}

interface MonthlyContributionResponse {
  data: MonthlyContribution & {
    _id: string;
    isActive: boolean;
    amount: number;
    dayOfMonth: number;
  };
}

const MonthlyContributionsPanel: React.FC<MonthlyContributionsPanelProps> = ({ userId, fundId }) => {
  const [contributions, setContributions] = useState<MonthlyContribution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadContributions = useCallback(async (): Promise<void> => {
    if (!fundId || !userId) {
      setError('ID do fundo e usuário são necessários');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const loadedContributions = await localStorageService.getMonthlyContributions(fundId, userId);
      setContributions(Array.isArray(loadedContributions) ? loadedContributions : []);
    } catch (err: unknown) {
      setError('Erro ao carregar contribuições');
      console.error('Error loading contributions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fundId, userId]);

  useEffect(() => {
    loadContributions();
  }, [loadContributions]);

  const handleNewContribution = async (contribution: MonthlyContribution): Promise<void> => {
    if (!contribution._id) {
      setError('Contribuição inválida');
      return;
    }

    try {
      setError(null);
      const savedContribution = await monthlyContributionService.create(contribution) as MonthlyContributionResponse;
      setContributions(prev => [...prev, savedContribution.data]);
    } catch (err: unknown) {
      setError('Erro ao adicionar contribuição');
      throw err;
    }
  };

  const handleDeleteContribution = async (id: string): Promise<void> => {
    if (!id) {
      setError('ID da contribuição é necessário');
      return;
    }

    try {
      setError(null);
      await monthlyContributionService.delete(id);
      setContributions(prev => prev.filter(c => c._id === id));
    } catch (err: unknown) {
      setError('Erro ao excluir contribuição');
      console.error('Error deleting contribution:', err);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean): Promise<void> => {
    if (!id) {
      setError('ID da contribuição é necessário');
      return;
    }

    try {
      setError(null);
      const response = await monthlyContributionService.update(id, { isActive }) as MonthlyContributionResponse;
      
      if (!response.data) {
        throw new Error('Resposta inválida do servidor');
      }

      setContributions(prev =>
        prev.map(c => c._id === id ? { ...c, ...response.data } : c)
      );
    } catch (err: unknown) {
      setError('Erro ao atualizar contribuição');
      console.error('Error updating contribution:', err);
    }
  };

  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center h-24 ${isDark ? 'text-white' : 'text-gray-700'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <h3 className="text-lg font-medium">Contribuições Mensais</h3>
      
      <MonthlyContributionForm
        fundId={fundId}
        userId={userId}
        onSubmit={handleNewContribution}
        onError={(err: Error) => setError(err.message)}
      />

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mt-4">
        {contributions.length === 0 ? (
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Nenhuma contribuição mensal configurada
          </p>
        ) : (
          <ul className="space-y-3">
            {contributions.map(contribution => {
              if (!contribution._id) return null;

              const amount = typeof contribution.amount === 'number' ? contribution.amount : 0;
              const isActive = Boolean(contribution.isActive);
              const dayOfMonth = contribution.dayOfMonth || 1;

              return (
                <li
                  key={contribution._id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div>
                    <p className="font-medium">
                      €{amount.toFixed(2)} / mês
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Dia {dayOfMonth} de cada mês
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleToggleActive(contribution._id, isActive)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        isActive
                          ? 'bg-green-100 text-green-800'
                          : isDark 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {isActive ? 'Ativo' : 'Inativo'}
                    </button>
                    <button
                      onClick={() => handleDeleteContribution(contribution._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MonthlyContributionsPanel;
