import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../../shared/types/user.types';
import { Expense, Investment, TravelFund, MonthlySalary } from '../../types';
import { localStorageService } from '../../shared/services/localStorageService';
import axios from 'axios';
import { TravelFundListResponse } from '../../shared/types/api.types';
import DashboardComponent from '../../components/Dashboard';

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

  // Admin users veem todos os dados (IDs específicos)
  const adminIds = ['6884f1b07f0be3c02772d85c', '6884f319e268d1d9a7613530']; // Antonio e Jhessika
  const isAdmin = adminIds.includes(currentUser._id!);
  
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

  return (
    <DashboardComponent
      currentUser={currentUser}
      expenses={expenses}
      investments={investments}
      travelFunds={travelFunds}
      monthlySalaries={monthlySalaries}
      isLoadingTravelFund={isLoadingTravelFund}
      travelFundError={travelFundError}
    />
  );
};
