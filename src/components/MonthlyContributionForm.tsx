import React, { useState } from 'react';
import { MonthlyContribution } from '@shared/types/core.types';

interface MonthlyContributionFormProps {
  fundId: string;
  userId: string;
  fundType: 'emergency' | 'travel' | 'car' | 'allowance';
  onSubmit: (contribution: MonthlyContribution) => void;
  onError: (message: string) => void;
}

const MonthlyContributionForm: React.FC<MonthlyContributionFormProps> = ({
  fundId,
  userId,
  fundType,
  onSubmit,
  onError
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Define the contribution type explicitly
      const contribution: MonthlyContribution = {
        amount,
        dayOfMonth,
        fundId,
        userId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        currency: 'EUR',
        fundType
      };
      
      onSubmit(contribution);
      // Reset form
      setAmount(0);
      setDayOfMonth(1);
    } catch (err) {
      if (err instanceof Error) {
        onError(err.message);
      } else if (typeof err === 'string') {
        onError(err);
      } else {
        onError('An unknown error occurred');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Valor Mensal (€)
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Dia do Mês
          <input
            type="number"
            min="1"
            max="31"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Adicionar Contribuição Mensal
      </button>
    </form>
  );
};

export default MonthlyContributionForm;

// Example: define userId and fundId before using them
const userId = "yourUserId"; // Replace with actual user id value
const fundId = "yourFundId"; // Replace with actual fund id value
const handleNewContribution = () => {
  // handle contribution logic here
};
const setError = () => {
  // handle error logic here
};

<MonthlyContributionForm
  fundId={fundId}
  userId={userId}
  onSubmit={handleNewContribution}
  onError={setError} fundType={'emergency'}/>