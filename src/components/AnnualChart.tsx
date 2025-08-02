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
  const [users, setUsers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const { isDark } = useTheme();

  useEffect(() => {
    const currentYear = 2025; // Ano atual fixo para a aplicação
    
    // Carregar dados de despesas para o gráfico (filtrar por 2025 para o gráfico de barras)
    fetch('https://expense-management-back.onrender.com/api/dashboard/annual')
      .then(res => res.json())
      .then(result => {
        // Filtrar apenas dados de 2025 para o gráfico
        const data2025 = result.data.filter((monthData: any) => {
          // O mês está no formato numérico (1-12), então precisamos criar uma data para o primeiro dia desse mês em 2025
          const date = new Date(2025, monthData.month - 1, 1);
          return date.getFullYear() === currentYear;
        });
        setData(data2025);
      })
      .catch(console.error);
    
    // Carregar todos os dados de salários
    fetch(`https://expense-management-back.onrender.com/api/salaries`)
      .then(res => res.json())
      .then(result => {
        // Filtrar salários de 2025
        const salaries2025 = result.filter((salary: any) => {
          const salaryDate = new Date(salary.date);
          return salaryDate.getFullYear() === currentYear;
        });
        setSalaries(salaries2025);
      })
      .catch(console.error);
    
    // Carregar usuários
    fetch('https://expense-management-back.onrender.com/api/users')
      .then(res => res.json())
      .then(result => setUsers(result))
      .catch(console.error);
    
    // Carregar todas as despesas
    fetch('https://expense-management-back.onrender.com/api/expenses')
      .then(res => res.json())
      .then(result => {
        // Filtrar apenas despesas de 2025
        const expenses2025 = result.filter((expense: any) => {
          const expenseDate = new Date(expense.createdAt);
          return expenseDate.getFullYear() === currentYear;
        });
        setExpenses(expenses2025);
      })
      .catch(console.error);
  }, []);

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  // Proteger contra array vazio com fallback para 1 (evitar divisão por zero)
  const maxExpense = data.length > 0 ? Math.max(...data.map(d => Math.abs(d.expenses))) : 1;

  // Calcular saldo (incluindo todas as transações)
  const totalSalaries = salaries.reduce((sum, salary) => sum + salary.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Math.abs(expense.amount), 0);
  // const balance = totalSalaries - totalExpenses;

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <h3>Relatório Anual 2025</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ padding: '15px', backgroundColor: isDark ? '#1565c0' : '#e3f2fd', borderRadius: '6px', textAlign: 'center' }}>
          <h4>Salário Anual (até agora)</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>€{totalSalaries.toFixed(2)}</p>
        </div>
        <div style={{ padding: '15px', backgroundColor: isDark ? '#991b1b' : '#ffe4e1', borderRadius: '6px', textAlign: 'center' }}>
          <h4>Despesas Anuais (até agora)</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>€{totalExpenses.toFixed(2)}</p>
        </div>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h4>Resumo por Usuário</h4>
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {users.map(user => {
            // Usar todos os salários deste usuário
            const userSalaries = salaries
              .filter(s => s.userId === user._id)
              .reduce((sum, s) => sum + s.amount, 0);
            // Usar todas as despesas deste usuário
            const userExpenses = expenses
              .filter(e => e.userId === user._id)
              .reduce((sum, e) => sum + Math.abs(e.amount), 0);
            return (
              <div key={user._id} style={{
                padding: '20px',
                backgroundColor: isDark ? '#3d3d3d' : 'white',
                borderRadius: '8px',
                border: `1px solid ${isDark ? '#555' : '#ddd'}`
              }}>
                <h5 style={{ marginBottom: '15px', color: isDark ? '#fff' : '#333' }}>{user.name}</h5>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: isDark ? '#ccc' : '#666' }}>Salários Anuais:</span>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff', margin: '5px 0' }}>
                    €{userSalaries.toFixed(2)}
                  </p>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: isDark ? '#ccc' : '#666' }}>Despesas Anuais:</span>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545', margin: '5px 0' }}>
                    €{userExpenses.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <h4>Gastos Mensais</h4>
      <div style={{ 
        overflowX: 'auto', 
        width: '100%',
        paddingBottom: '10px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end',
          gap: '10px', 
          height: '200px',
          minWidth: window.innerWidth <= 768 ? '600px' : 'auto',
          paddingBottom: '5px'
        }}>
          {data.length > 0 ? (
            data.map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1,
                minWidth: '30px'
              }}>
                <div style={{
                  height: `${(Math.abs(item.expenses) / maxExpense) * 150}px`,
                  backgroundColor: isDark ? '#4a90e2' : '#007bff',
                  width: '100%',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '5px'
                }}></div>
                <small style={{ marginTop: '5px', fontSize: '12px' }}>
                  {months[item.month - 1]}
                </small>
                <small style={{ fontSize: '10px', color: isDark ? '#ccc' : '#666' }}>
                  €{Math.abs(item.expenses).toFixed(0)}
                </small>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <p>Carregando dados ou nenhum dado disponível para 2025</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
