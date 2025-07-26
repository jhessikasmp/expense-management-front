import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

interface MonthlyData {
  month: number;
  expenses: number;
  count: number;
}

export const AnnualChart: React.FC = () => {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const { isDark } = useTheme();

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    
    // Carregar dados de despesas
    fetch('https://expense-management-back.onrender.com/api/dashboard/annual')
      .then(res => res.json())
      .then(result => setData(result.data))
      .catch(console.error);
    
    // Carregar dados de salários
    fetch(`https://expense-management-back.onrender.com/api/salaries/annual/${currentYear}`)
      .then(res => res.json())
      .then(result => setSalaries(result))
      .catch(console.error);
  }, []);

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const maxExpense = Math.max(...data.map(d => Math.abs(d.expenses)));

  const currentMonth = new Date().getMonth() + 1;
  const totalSalaries = salaries.reduce((sum, salary) => sum + salary.amount, 0);
  const totalExpenses = Math.abs(data.reduce((sum, expense) => sum + expense.expenses, 0));
  const balance = totalSalaries - totalExpenses;

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <h3>Relatório Anual 2025</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ padding: '15px', backgroundColor: isDark ? '#1565c0' : '#e3f2fd', borderRadius: '6px', textAlign: 'center' }}>
          <h4>Salário Anual (até agora)</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>€{totalSalaries.toFixed(2)}</p>
        </div>
        <div style={{ padding: '15px', backgroundColor: isDark ? '#991b1b' : '#ffe4e1', borderRadius: '6px', textAlign: 'center' }}>
          <h4>Despesas Anuais (até agora)</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>€{totalExpenses.toFixed(2)}</p>
        </div>
        <div style={{ padding: '15px', backgroundColor: balance >= 0 ? (isDark ? '#166534' : '#d4edda') : (isDark ? '#991b1b' : '#f8d7da'), borderRadius: '6px', textAlign: 'center' }}>
          <h4>Saldo Anual (restante)</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: balance >= 0 ? '#28a745' : '#dc3545' }}>
            €{balance.toFixed(2)}
          </p>
        </div>
      </div>
      
      <h4>Gastos Mensais</h4>
      <div style={{ display: 'flex', alignItems: 'end', gap: '10px', height: '200px' }}>
        {data.map((item, index) => (
          <div key={item.month} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            flex: 1
          }}>
            <div style={{
              height: `${(Math.abs(item.expenses) / maxExpense) * 150}px`,
              backgroundColor: isDark ? '#4a90e2' : '#007bff',
              width: '100%',
              borderRadius: '4px 4px 0 0',
              minHeight: '5px'
            }}></div>
            <small style={{ marginTop: '5px', fontSize: '12px' }}>
              {months[index]}
            </small>
            <small style={{ fontSize: '10px', color: isDark ? '#ccc' : '#666' }}>
              €{Math.abs(item.expenses).toFixed(0)}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};