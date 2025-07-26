import React, { useState, useEffect } from 'react';
import { User, Expense, Investment, TravelFund } from '../types';
import { userService, expenseService, investmentService, travelFundService, salaryService } from '../services/api';
import { useTheme } from './ThemeProvider';

interface DashboardProps {
  currentUser: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [travelFunds, setTravelFunds] = useState<TravelFund[]>([]);
  const [monthlySalaries, setMonthlySalaries] = useState<any[]>([]);
  const { isDark } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      const [usersRes, expensesRes, investmentsRes, fundsRes, salariesRes] = await Promise.all([
        userService.list(),
        expenseService.list(),
        investmentService.list(),
        travelFundService.list(),
        salaryService.getAnnual(currentYear)
      ]);
      
      // Filtrar despesas apenas do mês atual
      const monthlyExpenses = expensesRes.data.filter(expense => {
        const expenseDate = new Date(expense.createdAt!);
        return expenseDate.getMonth() + 1 === currentMonth && expenseDate.getFullYear() === currentYear;
      });
      
      setUsers(usersRes.data);
      setExpenses(monthlyExpenses);
      setInvestments(investmentsRes.data);
      setTravelFunds(fundsRes.data);
      setMonthlySalaries(salariesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const currentMonth = new Date().getMonth() + 1;
  const totalExpenses = Math.abs(expenses.reduce((sum, expense) => sum + expense.amount, 0));
  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.quantity * inv.unitPrice), 0);
  const totalTravelFunds = travelFunds.reduce((sum, fund) => sum + fund.total, 0);
  const totalMonthlySalaries = monthlySalaries
    .filter(salary => salary.month === currentMonth)
    .reduce((sum, salary) => sum + salary.amount, 0);
  const remainingBalance = totalMonthlySalaries - totalExpenses;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard Financeiro</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: isDark ? '#1565c0' : '#e3f2fd', 
          borderRadius: '8px',
          color: isDark ? 'white' : 'black'
        }}>
          <h3>Salários do Mês</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>€{totalMonthlySalaries.toFixed(2)}</p>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: isDark ? '#991b1b' : '#f8d7da', 
          borderRadius: '8px',
          color: isDark ? 'white' : 'black'
        }}>
          <h3>Total Despesas</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>€{totalExpenses.toFixed(2)}</p>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: remainingBalance >= 0 ? (isDark ? '#166534' : '#d4edda') : (isDark ? '#991b1b' : '#f8d7da'), 
          borderRadius: '8px',
          color: isDark ? 'white' : 'black'
        }}>
          <h3>Saldo do Mês</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: remainingBalance >= 0 ? '#28a745' : '#dc3545' }}>
            €{remainingBalance.toFixed(2)}
          </p>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: isDark ? '#166534' : '#f0fff0', 
          borderRadius: '8px',
          color: isDark ? 'white' : 'black'
        }}>
          <h3>Total Investimentos</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>€{totalInvestments.toFixed(2)}</p>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: isDark ? '#a16207' : '#fff8dc', 
          borderRadius: '8px',
          color: isDark ? 'white' : 'black'
        }}>
          <h3>Fundos de Viagem</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>€{totalTravelFunds.toFixed(2)}</p>
        </div>
      </div>


    </div>
  );
};