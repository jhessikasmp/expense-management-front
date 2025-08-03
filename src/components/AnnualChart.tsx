import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../shared/components/ThemeProvider';
import { User } from '../shared/types/user.types';
import { Salary, Expense } from '../types/annual.types';

interface UserStats {
  id: string;
  name: string;
  totalSalary: number;
  totalExpenses: number;
  balance: number;
}

export const AnnualChart: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [users, setUsers] = useState<User[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, salariesRes, expensesRes] = await Promise.all([
        fetch(`/api/users`),
        fetch(`/api/salaries?year=${selectedYear}`),
        fetch(`/api/expenses?year=${selectedYear}`)
      ]);

      if (!usersRes.ok || !salariesRes.ok || !expensesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [usersData, salariesData, expensesData] = await Promise.all([
        usersRes.json(),
        salariesRes.json(),
        expensesRes.json()
      ]);

      setUsers(usersData);
      setSalaries(salariesData);
      setExpenses(expensesData);
    } catch (error) {
      setError('Error fetching data. Please try again later.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [selectedYear, fetchData]);

  const userStats = useMemo(() => {
    return users.map(user => {
      const userSalaries = salaries
        .filter(s => s.userId === user.id)
        .reduce((sum, s) => sum + s.amount, 0);
      const userExpenses = expenses
        .filter(e => e.userId === user.id)
        .reduce((sum, e) => sum + Math.abs(e.amount), 0);
      return {
        id: user.id,
        name: user.name,
        totalSalary: userSalaries,
        totalExpenses: userExpenses,
        balance: userSalaries - userExpenses
      };
    });
  }, [users, salaries, expenses]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  const totalSalaries = salaries.reduce((sum, salary) => sum + salary.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Math.abs(expense.amount), 0);

  return (
    <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Financial Overview {selectedYear}</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className={`rounded-md px-3 py-2 ${
            isDark 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-white text-gray-800 border-gray-300'
          }`}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className={`p-6 rounded-lg ${isDark ? 'bg-blue-900' : 'bg-blue-50'}`}>
          <h3 className="text-lg font-medium mb-2">Total Annual Salary</h3>
          <p className="text-2xl font-bold text-blue-500">€{totalSalaries.toFixed(2)}</p>
        </div>
        <div className={`p-6 rounded-lg ${isDark ? 'bg-red-900' : 'bg-red-50'}`}>
          <h3 className="text-lg font-medium mb-2">Total Annual Expenses</h3>
          <p className="text-2xl font-bold text-red-500">€{totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {userStats.map(stat => (
          <div
            key={stat.id}
            className={`p-5 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            } shadow-sm`}
          >
            <h3 className="text-lg font-semibold mb-3">{stat.name}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Salary:</span>
                <span className="text-green-500">€{stat.totalSalary.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Expenses:</span>
                <span className="text-red-500">€{stat.totalExpenses.toFixed(2)}</span>
              </div>
              <div className={`pt-2 mt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="flex justify-between font-medium">
                  <span>Balance:</span>
                  <span className={stat.balance >= 0 ? 'text-green-500' : 'text-red-500'}>
                    €{stat.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
