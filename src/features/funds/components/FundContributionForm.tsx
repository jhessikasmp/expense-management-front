import React, { useState, ChangeEvent } from 'react';
import { User } from '../../../types';
import { useTheme } from '../../../shared/components/ThemeProvider';

interface FundContributionFormProps {
  fundId: string;
  fundType: 'travel' | 'emergency' | 'car' | 'allowance';
  currentUser: User;
  availableBalance: number;
  onContribute: (amount: number, date: string) => Promise<void>;
}

export const FundContributionForm: React.FC<FundContributionFormProps> = ({
  fundId,
  fundType,
  currentUser,
  availableBalance,
  onContribute
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('O valor da contribuição deve ser maior que zero');
      return;
    }

    if (amount > availableBalance) {
      setError('Valor maior que o saldo disponível');
      return;
    }

    try {
      setIsSubmitting(true);
      await onContribute(amount, date);
      // Reset form
      setAmount(0);
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setError('Erro ao adicionar contribuição. Tente novamente.');
      console.error('Error adding contribution:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
  };

  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Adicionar ao Fundo
      </h3>
      
      <div className={`mb-4 p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Saldo Disponível: €{availableBalance.toFixed(2)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Valor
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>€</span>
              </div>
              <input
                type="number"
                value={amount || ''}
                onChange={handleAmountChange}
                step="0.01"
                min="0"
                className={`block w-full pl-7 pr-12 rounded-md ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300 text-gray-900'
                } focus:ring-blue-500 focus:border-blue-500`}
                placeholder="0.00"
                required
              />
            </div>
          </label>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Data
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`mt-1 block w-full rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500`}
              required
            />
          </label>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : isDark
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isSubmitting ? 'Adicionando...' : 'Adicionar ao Fundo'}
        </button>
      </form>
    </div>
  );
};
