import React from 'react';
import type { User } from '../shared/types/user.types';
import { Expense, Investment, TravelFund, MonthlySalary } from '../types';
import { useTheme } from '../shared/components/ThemeProvider';

interface DashboardProps {
  currentUser?: User; // Made optional since it's not being used in this component
  expenses: Expense[];
  investments: Investment[];
  travelFunds: TravelFund[];
  monthlySalaries: MonthlySalary[];
  isLoadingTravelFund: boolean;
  travelFundError: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  expenses,
  investments,
  travelFunds,
  monthlySalaries,
  isLoadingTravelFund,
  travelFundError
}) => {
  const { isDark } = useTheme();
  
  // Calculate totals
  const totalExpenses = Math.abs(expenses.reduce((sum, expense) => sum + expense.amount, 0));
  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.quantity * inv.unitPrice), 0);
  
  // Date related constants
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const targetYear = currentDate.getFullYear();
  
  const totalTravelFunds = travelFunds
    .filter(fund => fund.createdAt && 
      new Date(fund.createdAt).getMonth() + 1 === currentMonth && 
      new Date(fund.createdAt).getFullYear() === targetYear
    )
    .reduce((sum, fund) => sum + fund.total, 0);

  const totalMonthlySalaries = monthlySalaries.reduce((sum, salary) => sum + salary.amount, 0);
  const remainingBalance = totalMonthlySalaries - totalExpenses;

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-6">Dashboard Financeiro</h2>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Salários do Mês */}
        <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <h4 className="text-sm font-medium">Salários do Mês</h4>
          <p className="text-2xl font-bold">€{totalMonthlySalaries.toFixed(2)}</p>
        </div>
        
        {/* Total Despesas */}
        <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <h4 className="text-sm font-medium">Total Despesas</h4>
          <p className="text-2xl font-bold">€{totalExpenses.toFixed(2)}</p>
        </div>
        
        {/* Saldo do Mês */}
        <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <h4 className="text-sm font-medium">Saldo do Mês</h4>
          <p className={`text-2xl font-bold ${
            remainingBalance >= 0 
              ? 'text-green-500' 
              : 'text-red-500'
          }`}>
            €{remainingBalance.toFixed(2)}
          </p>
        </div>
        
        {/* Total Investimentos */}
        <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <h4 className="text-sm font-medium">Total Investimentos</h4>
          <p className="text-2xl font-bold">€{totalInvestments.toFixed(2)}</p>
        </div>
        
        {/* Fundo de Viagem */}
        <div className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <h4 className="text-sm font-medium">Fundo de Viagem</h4>
          {isLoadingTravelFund ? (
            <p className="text-2xl font-bold">Carregando...</p>
          ) : travelFundError ? (
            <p className="text-red-500 text-sm">Erro ao carregar fundos</p>
          ) : (
            <p className="text-2xl font-bold">€{totalTravelFunds.toFixed(2)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
