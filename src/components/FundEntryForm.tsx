import React, { useState } from 'react';

interface FundEntryFormProps {
  onSubmit: (entry: {amount: number; description: string}) => void;
  onError: (error: Error) => void;
}

const FundEntryForm: React.FC<FundEntryFormProps> = ({
  onSubmit,
  onError
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onSubmit({
        amount,
        description
      });
      setAmount(0);
      setDescription('');
    } catch (err) {
      onError(err instanceof Error ? err : new Error('Erro ao adicionar entrada'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900">Adicionar Entrada ao Fundo</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Valor (€)
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
          Descrição
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ex: Aporte mensal, Bônus, etc."
          />
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Adicionar Entrada
      </button>
    </form>
  );
};

export default FundEntryForm;