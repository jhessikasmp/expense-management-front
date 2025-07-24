import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

interface MonthlyData {
  month: number;
  expenses: number;
  count: number;
}

export const AnnualChart: React.FC = () => {
  const [data, setData] = useState<MonthlyData[]>([]);
  const { isDark } = useTheme();

  useEffect(() => {
    fetch('http://localhost:4000/api/dashboard/annual')
      .then(res => res.json())
      .then(result => setData(result.data))
      .catch(console.error);
  }, []);

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const maxExpense = Math.max(...data.map(d => d.expenses));

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <h3>Gastos Anuais 2025</h3>
      <div style={{ display: 'flex', alignItems: 'end', gap: '10px', height: '200px' }}>
        {data.map((item, index) => (
          <div key={item.month} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            flex: 1
          }}>
            <div style={{
              height: `${(item.expenses / maxExpense) * 150}px`,
              backgroundColor: isDark ? '#4a90e2' : '#007bff',
              width: '100%',
              borderRadius: '4px 4px 0 0',
              minHeight: '5px'
            }}></div>
            <small style={{ marginTop: '5px', fontSize: '12px' }}>
              {months[index]}
            </small>
            <small style={{ fontSize: '10px', color: isDark ? '#ccc' : '#666' }}>
              €{item.expenses.toFixed(0)}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};