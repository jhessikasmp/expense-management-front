import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Investment } from '@shared/types';
import { investmentService } from '@shared/services';
import { AccordionItem } from '@shared/components/AccordionItem';
import { useTheme } from '@shared/components/ThemeProvider';

interface InvestmentFormData {
  asset: string;
  quantity: number;
  unitPrice: number;
  description: string;
}

interface InvestmentPanelProps {
  currentUser: User;
}

export const InvestmentPanel: React.FC<InvestmentPanelProps> = ({ currentUser }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [formData, setFormData] = useState<InvestmentFormData>({
    asset: '',
    quantity: 0,
    unitPrice: 0,
    description: ''
  });

  const loadInvestments = useCallback(async (): Promise<void> => {
    try {
      const response = await investmentService.list(currentUser._id);
      if (Array.isArray(response.data)) {
        setInvestments(response.data);
      }
    } catch (error: unknown) {
      console.error('Erro ao carregar investimentos:', error);
    }
  }, [currentUser._id]);

  const handleDelete = useCallback(async (id: string): Promise<void> => {
    if (window.confirm('Tem certeza que deseja excluir este investimento?')) {
      try {
        await investmentService.delete(id);
        await loadInvestments();
      } catch (error: unknown) {
        console.error('Erro ao excluir investimento:', error);
      }
    }
  }, [loadInvestments]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const newInvestment = {
        userId: currentUser._id,
        asset: formData.asset.trim(),
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
        description: formData.description.trim(),
        currency: 'EUR'
      };

      await investmentService.create(newInvestment);
      setFormData({
        asset: '',
        quantity: 0,
        unitPrice: 0,
        description: ''
      });
      await loadInvestments();
    } catch (error: unknown) {
      console.error('Erro ao criar investimento:', error);
    }
  }, [currentUser._id, formData, loadInvestments]);

  const handleNumberChange = useCallback((field: keyof Pick<InvestmentFormData, 'quantity' | 'unitPrice'>) => 
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value)) {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    }, []);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  const categorizeInvestments = useMemo(() => {
    const categories = {
      etfs: [] as Investment[],
      crypto: [] as Investment[],
      stocks: [] as Investment[],
      funds: [] as Investment[],
      others: [] as Investment[],
    };

    investments.forEach(inv => {
      const asset = inv.asset.toLowerCase();
      if (asset.endsWith('.etf') || asset.includes('etf')) {
        categories.etfs.push(inv);
      } else if (
        asset.includes('bitcoin') || 
        asset.includes('ethereum') || 
        asset.includes('crypto') ||
        asset.includes('btc') ||
        asset.includes('eth')
      ) {
        categories.crypto.push(inv);
      } else if (asset.match(/^[A-Z]{2,5}$/)) { // Stock symbols are usually 2-5 capital letters
        categories.stocks.push(inv);
      } else if (asset.includes('fund') || asset.includes('fi')) {
        categories.funds.push(inv);
      } else {
        categories.others.push(inv);
      }
    });

    return categories;
  }, [investments]);

  const getCategoryTotal = useCallback((investments: Investment[]): number => 
    investments.reduce((total, inv) => total + (Number(inv.quantity || 0) * Number(inv.unitPrice || 0)), 0), []);

  const totalValue = useMemo((): number => 
    Object.values(categorizeInvestments)
      .flat()
      .reduce((total, inv) => total + (Number(inv.quantity || 0) * Number(inv.unitPrice || 0)), 0),
    [categorizeInvestments]);

  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className={`space-y-4 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Ativo
            <input
              type="text"
              value={formData.asset}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData(prev => ({ ...prev, asset: e.target.value }))}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
              required
            />
          </label>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Quantidade
            <input
              type="number"
              step="0.000001"
              min="0"
              value={formData.quantity}
              onChange={handleNumberChange('quantity')}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
              required
            />
          </label>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Preço Unitário (€)
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={handleNumberChange('unitPrice')}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
              required
            />
          </label>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Descrição
            <input
              type="text"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
            />
          </label>
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 text-white font-medium rounded-md ${
            isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Adicionar Investimento
        </button>
      </form>

      <div className="mt-8">
        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Total de Investimentos: €{totalValue.toFixed(2)}
        </h2>

        {Object.entries(categorizeInvestments).map(([category, items]) => {
          if (items.length === 0) return null;
          
          const categoryTotal = getCategoryTotal(items);
          const categoryTitles = {
            etfs: 'ETFs',
            crypto: 'Criptomoedas',
            stocks: 'Ações',
            funds: 'Fundos',
            others: 'Outros'
          } as const;

          return (
            <AccordionItem 
              key={category} 
              title={categoryTitles[category as keyof typeof categoryTitles]} 
              total={categoryTotal}
            >
              <div className="space-y-4">
                {items.map(investment => (
                  <div 
                    key={investment._id} 
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      isDark ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {investment.asset}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {Number(investment.quantity || 0).toFixed(6)} unidades x €{Number(investment.unitPrice || 0).toFixed(2)}
                      </p>
                      {investment.description && (
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {investment.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <p className={`mr-6 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        €{((investment.quantity ?? 0) * (investment.unitPrice ?? 0)).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleDelete(investment._id ?? '')}
                        className="text-red-600 hover:text-red-800"
                        title="Excluir investimento"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionItem>
          );
        })}
      </div>
    </div>
  );
};