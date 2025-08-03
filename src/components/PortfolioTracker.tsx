import React, { useMemo } from 'react';
import { Investment } from '../types';

interface PortfolioTrackerProps {
  investments: Investment[];
}

interface AssetGroup {
  asset: string;
  totalQuantity: number;
  averagePrice: number;
  totalValue: number;
  investments: Investment[];
}

export const PortfolioTracker: React.FC<PortfolioTrackerProps> = ({ investments }) => {
  // Agrupar investimentos por ativo e calcular médias
  const { groupedInvestments, totalPortfolioValue } = useMemo(() => {
    const groups: { [key: string]: AssetGroup } = {};
    
    investments.forEach(inv => {
      if (!groups[inv.asset]) {
        groups[inv.asset] = {
          asset: inv.asset,
          totalQuantity: 0,
          averagePrice: 0,
          totalValue: 0,
          investments: []
        };
      }
      
      const group = groups[inv.asset];
      const investmentValue = inv.quantity * inv.unitPrice;
      
      group.totalQuantity += inv.quantity;
      group.totalValue += investmentValue;
      group.investments.push(inv);
    });

    // Calcular preço médio para cada grupo
    Object.values(groups).forEach(group => {
      group.averagePrice = group.totalValue / group.totalQuantity;
    });

    const totalValue = Object.values(groups).reduce(
      (total, group) => total + group.totalValue, 
      0
    );

    return {
      groupedInvestments: Object.values(groups),
      totalPortfolioValue: totalValue
    };
  }, [investments]);

  return (
    <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
        Portfólio de Investimentos
      </h3>
      
      <div className="space-y-4">
        {groupedInvestments.map((group) => (
          <div key={group.asset} className="p-3 bg-gray-50 rounded dark:bg-gray-700">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{group.asset}</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Quantidade Total: {group.totalQuantity.toFixed(6)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  Preço Médio: €{group.averagePrice.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Total: €{group.totalValue.toFixed(2)}
                </p>
              </div>
            </div>
            {/* Lista de transações individuais */}
            <div className="mt-2 pl-4 space-y-1">
              {group.investments.map((inv) => (
                <div key={inv._id} className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                  <span>Compra: {inv.quantity.toFixed(6)} × €{inv.unitPrice.toFixed(2)}</span>
                  <span>€{(inv.quantity * inv.unitPrice).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="font-medium text-lg text-gray-900 dark:text-white">
            Valor Total do Portfólio:
          </span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            €{totalPortfolioValue.toFixed(2)}
          </span>
        </div>

        {/* Adicionar estatísticas adicionais */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Número de Ativos
            </p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {groupedInvestments.length}
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900 rounded">
            <p className="text-sm text-green-800 dark:text-green-200">
              Total de Transações
            </p>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">
              {investments.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioTracker;
