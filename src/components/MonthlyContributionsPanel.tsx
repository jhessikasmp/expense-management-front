import React, { useEffect, useState } from 'react';
import { monthlyContributionService } from '../services/api';
import { MonthlyContribution } from '../types';
import MonthlyContributionForm from './MonthlyContributionForm';

interface MonthlyContributionsPanelProps {
  userId: string;
  fundId: string;
}

const MonthlyContributionsPanel: React.FC<MonthlyContributionsPanelProps> = ({ userId, fundId }) => {
  const [contributions, setContributions] = useState<MonthlyContribution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContributions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await monthlyContributionService.list(userId, fundId);
      setContributions(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar contribuições mensais');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, fundId]);

  useEffect(() => {
    loadContributions();
  }, [loadContributions]);

  const handleNewContribution = (contribution: MonthlyContribution) => {
    setContributions(prev => [...prev, contribution]);
  };

  const handleDeleteContribution = async (id: string) => {
    try {
      await monthlyContributionService.delete(id);
      setContributions(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      setError('Erro ao excluir contribuição');
      console.error(err);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await monthlyContributionService.update(id, { isActive });
      setContributions(prev =>
        prev.map(c => c._id === id ? { ...c, ...response.data } : c)
      );
    } catch (err) {
      setError('Erro ao atualizar contribuição');
      console.error(err);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Contribuições Mensais</h3>
    
    <MonthlyContributionForm
      fundId={fundId as string}
      userId={userId as string}
      onSubmit={handleNewContribution as (contribution: MonthlyContribution) => void}
      onError={(err: Error) => setError(err.message)}
    />

    {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mt-4">
        {contributions.length === 0 ? (
          <p className="text-gray-500">Nenhuma contribuição mensal configurada</p>
        ) : (
          <ul className="space-y-3">
            {contributions.map(contribution => (
              <li
                key={contribution._id}
                className="flex items-center justify-between p-4 bg-white shadow-sm rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    €{contribution.amount.toFixed(2)} / mês
                  </p>
                  <p className="text-sm text-gray-500">
                    Dia {contribution.dayOfMonth} de cada mês
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleToggleActive(contribution._id!, !contribution.isActive)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      contribution.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {contribution.isActive ? 'Ativo' : 'Inativo'}
                  </button>
                  <button
                    onClick={() => handleDeleteContribution(contribution._id!)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MonthlyContributionsPanel;
