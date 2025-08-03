import React, { useState, useEffect, useCallback } from 'react';
import { User, Expense, Investment, TravelFund, MonthlySalary } from '../../types';
import { useTheme } from '../../shared/hooks/useTheme';
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
        const userTravelFunds = response.data.data.filter(fund => 
          isAdmin || fund.userId === currentUser._id
        );
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={`p-5 rounded-lg ${isDark ? 'bg-blue-900 text-white' : 'bg-blue-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Salários do Mês</h3>
          <p className="text-2xl font-bold">€{totalMonthlySalaries.toFixed(2)}</p>
        </div>
        
        <div className={`p-5 rounded-lg ${isDark ? 'bg-red-900 text-white' : 'bg-red-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Total Despesas</h3>
          <p className="text-2xl font-bold">€{totalExpenses.toFixed(2)}</p>
        </div>
        
        <div className={`p-5 rounded-lg ${
          remainingBalance >= 0 
            ? isDark ? 'bg-green-900 text-white' : 'bg-green-50'
            : isDark ? 'bg-red-900 text-white' : 'bg-red-50'
        }`}>
          <h3 className="text-lg font-semibold mb-2">Saldo do Mês</h3>
          <p className={`text-2xl font-bold ${
            remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            €{remainingBalance.toFixed(2)}
          </p>
        </div>
        
        <div className={`p-5 rounded-lg ${isDark ? 'bg-green-900 text-white' : 'bg-green-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Total Investimentos</h3>
          <p className="text-2xl font-bold">€{totalInvestments.toFixed(2)}</p>
        </div>
        
        <div className={`p-5 rounded-lg ${isDark ? 'bg-yellow-900 text-white' : 'bg-yellow-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Fundo de Viagem</h3>
          {isLoadingTravelFund ? (
            <p className="text-2xl font-bold">Carregando...</p>
          ) : travelFundError ? (
            <p className="text-red-600 text-sm">{travelFundError}</p>
          ) : (
            <p className="text-2xl font-bold">€{totalTravelFunds.toFixed(2)}</p>
          )}
        </div>
      </div>
    </div>
  );
};
