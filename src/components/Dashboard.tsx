import React, { useState, useEffect } from 'react';
import { User, Expense, Investment, TravelFund } from '../types';
import { userService, expenseService, investmentService, travelFundService } from '../services/api';
import { useTheme } from './ThemeProvider';

export const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [travelFunds, setTravelFunds] = useState<TravelFund[]>([]);
  const { isDark } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, expensesRes, investmentsRes, fundsRes] = await Promise.all([
        userService.list(),
        expenseService.list(),
        investmentService.list(),
        travelFundService.list()
      ]);
      
      setUsers(usersRes.data);
      setExpenses(expensesRes.data);
      setInvestments(investmentsRes.data);
      setTravelFunds(fundsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.quantity * inv.unitPrice), 0);
  const totalTravelFunds = travelFunds.reduce((sum, fund) => sum + fund.total, 0);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard Financeiro</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: isDark ? '#1e3a8a' : '#f0f8ff', 
          borderRadius: '8px',
          color: isDark ? 'white' : 'black'
        }}>
          <h3>Usuários</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{users.length}</p>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: isDark ? '#991b1b' : '#ffe4e1', 
          borderRadius: '8px',
          color: isDark ? 'white' : 'black'
        }}>
          <h3>Total Despesas</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>€{totalExpenses.toFixed(2)}</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div>
          <h3>Despesas Recentes</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {expenses.slice(0, 5).map(expense => (
              <div key={expense._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                <strong>{expense.name}</strong> - €{expense.amount} ({expense.category})
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3>Investimentos</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {investments.slice(0, 5).map(investment => (
              <div key={investment._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                <strong>{investment.asset}</strong> - {investment.quantity} x €{investment.unitPrice}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};