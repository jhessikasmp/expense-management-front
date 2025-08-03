import React from 'react';
import { FundContribution } from '../../../types/fundContribution.types';
import { useTheme } from '../../../shared/hooks/useTheme';

interface FundContributionHistoryProps {
  contributions: FundContribution[];
  onDelete?: (id: string) => Promise<void>;
}

export const FundContributionHistory: React.FC<FundContributionHistoryProps> = ({
  contributions,
  onDelete
}) => {
  const { isDark } = useTheme();

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    if (window.confirm('Tem certeza que deseja excluir esta contribuição?')) {
      await onDelete(id);
    }
  };

  if (contributions.length === 0) {
    return (
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Nenhuma contribuição registrada
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {contributions.map(contribution => (
        <div
          key={contribution._id}
          className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          } flex justify-between items-center`}
        >
          <div>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              €{contribution.amount.toFixed(2)}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date(contribution.date).toLocaleDateString()}
            </p>
          </div>
          
          {onDelete && (
            <button
              onClick={() => contribution._id && handleDelete(contribution._id)}
              className="text-red-600 hover:text-red-800"
              title="Excluir contribuição"
            >
              🗑️
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
