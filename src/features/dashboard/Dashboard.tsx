import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../../shared/types/user.types';
import { Expense, Investment, TravelFund, MonthlySalary } from '../../types';
import { useTheme } from '../../shared/components/ThemeProvider';
import { localStorageService } from '../../shared/services/localStorageService';
import axios from 'axios';
import { TravelFundListResponse } from '../../shared/types/api.types';

const api = axios.create({
  baseURL: 'https://expense-management-back.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface DashboardProps {
  currentUser: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [travelFunds, setTravelFunds] = useState<TravelFund[]>([]);
  const [monthlySalaries, setMonthlySalaries] = useState<MonthlySalary[]>([]);
  const [isLoadingTravelFund, setIsLoadingTravelFund] = useState(true);
  const [travelFundError, setTravelFundError] = useState<string | null>(null);
  const { isDark } = useTheme();

  // Admin users veem todos os dados (IDs específicos)
  const adminIds = ['6884f1b07f0be3c02772d85c', '6884f319e268d1d9a7613530']; // Antonio e Jhessika
  const isAdmin = adminIds.includes(currentUser._id!);
  
  // Date related constants
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const targetYear = currentDate.getFullYear();

  const loadData = useCallback(async () => {
    try {
      // Get the current date for filtering
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Carregar dados do localStorage e API
      const allExpenses: Expense[] = localStorageService.getItem('expenses') ?? [];
      const allInvestments: Investment[] = localStorageService.getItem('investments') ?? [];
      const allMonthlySalaries: MonthlySalary[] = localStorageService.getItem('salaries') ?? [];
      
      // Fetch travel funds from API
      try {
        setIsLoadingTravelFund(true);
        const response = await api.get<TravelFundListResponse>('/travel-funds');
        const userTravelFunds = response.data.data
          .filter(fund => isAdmin || fund.userId === currentUser._id)
          .map(fund => ({
            ...fund,
            total: typeof fund.total === 'number' ? fund.total : 0
          }));
        setTravelFunds(userTravelFunds);
        setTravelFundError(null);
      } catch (error) {
        console.error('Erro ao carregar fundos de viagem:', error);
        setTravelFundError('Erro ao carregar fundos de viagem');
        setTravelFunds([]);
      } finally {
        setIsLoadingTravelFund(false);
      }
      
      // Filtrar dados pelo usuário atual e período
      const monthlyExpenses = allExpenses.filter(expense => 
        isAdmin || (
          expense.userId === currentUser._id &&
          new Date(expense.createdAt).getMonth() + 1 === month &&
          new Date(expense.createdAt).getFullYear() === year
        )
      );

      const userInvestments = allInvestments.filter(inv => 
        isAdmin || inv.userId === currentUser._id
      );

      const userSalaries = allMonthlySalaries.filter(salary => 
        isAdmin || (
          salary.userId === currentUser._id &&
          salary.month === month &&
          salary.year === year
        )
      );
      
      setExpenses(monthlyExpenses);
      setInvestments(userInvestments);
      setMonthlySalaries(userSalaries);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, [currentUser._id, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalExpenses = Math.abs(expenses.reduce((sum, expense) => sum + expense.amount, 0));
  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.quantity * inv.unitPrice), 0);
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
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className={`p-5 rounded-lg shadow-lg ${isDark ? 'bg-blue-900 text-white' : 'bg-blue-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Salários do Mês</h3>
          <p className="text-2xl font-bold">€{totalMonthlySalaries.toFixed(2)}</p>
          <div className="mt-4">
            {monthlySalaries.map(salary => (
              <div key={salary._id} className="text-sm mt-2 p-2 rounded bg-opacity-20 bg-white">
                <p className="font-semibold">€{salary.amount.toFixed(2)}</p>
                <p className="text-sm opacity-75">{salary.createdAt ? new Date(salary.createdAt).toLocaleDateString() : ''}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className={`p-5 rounded-lg shadow-lg ${isDark ? 'bg-red-900 text-white' : 'bg-red-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Total Despesas</h3>
          <p className="text-2xl font-bold">€{totalExpenses.toFixed(2)}</p>
          <div className="mt-4 max-h-48 overflow-y-auto">
            {expenses.map(expense => (
              <div key={expense._id} className="text-sm mt-2 p-2 rounded bg-opacity-20 bg-white">
                <p className="font-semibold">€{expense.amount.toFixed(2)}</p>
                <p className="text-sm">{expense.description}</p>
                <p className="text-xs opacity-75">{expense.category} - {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : ''}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className={`p-5 rounded-lg shadow-lg ${
          remainingBalance >= 0 
            ? isDark ? 'bg-green-900 text-white' : 'bg-green-50'
            : isDark ? 'bg-red-900 text-white' : 'bg-red-50'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Saldo do Mês</h3>
          <p className={`text-2xl font-bold ${
            remainingBalance >= 0 
              ? isDark ? 'text-green-300' : 'text-green-600'
              : isDark ? 'text-red-300' : 'text-red-600'
          }`}>
            €{remainingBalance.toFixed(2)}
          </p>
          <div className="mt-4 text-sm">
            <p>Receitas: €{totalMonthlySalaries.toFixed(2)}</p>
            <p>Despesas: €{totalExpenses.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Investment and Travel Fund Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-5 rounded-lg shadow-lg ${isDark ? 'bg-green-900 text-white' : 'bg-green-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Investimentos</h3>
          <p className="text-2xl font-bold mb-4">€{totalInvestments.toFixed(2)}</p>
          <div className="max-h-48 overflow-y-auto">
            {investments.map(inv => (
              <div key={inv._id} className="text-sm mt-2 p-2 rounded bg-opacity-20 bg-white">
                <p className="font-semibold">{inv.asset}</p>
                <p className="text-sm">Quantidade: {inv.quantity}</p>
                <p className="text-sm">Preço Unitário: €{inv.unitPrice.toFixed(2)}</p>
                <p className="text-sm font-medium">Total: €{(inv.quantity * inv.unitPrice).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className={`p-5 rounded-lg shadow-lg ${isDark ? 'bg-yellow-900 text-white' : 'bg-yellow-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Fundo de Viagem</h3>
          {isLoadingTravelFund ? (
            <p className="text-2xl font-bold">Carregando...</p>
          ) : travelFundError ? (
            <p className="text-red-600 text-sm">{travelFundError}</p>
          ) : (
            <>
              <p className="text-2xl font-bold mb-4">€{totalTravelFunds.toFixed(2)}</p>
              <div className="max-h-48 overflow-y-auto">
                {travelFunds
                  .filter(fund => 
                    fund.createdAt && 
                    new Date(fund.createdAt).getMonth() + 1 === currentMonth && 
                    new Date(fund.createdAt).getFullYear() === targetYear
                  )
                  .map(fund => (
                    <div key={fund._id} className="text-sm mt-2 p-2 rounded bg-opacity-20 bg-white">
                      <p className="font-semibold">€{fund.total.toFixed(2)}</p>
                      <p className="text-xs opacity-75">
                        {fund.createdAt ? new Date(fund.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  ))
                }
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
