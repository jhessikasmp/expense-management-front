import React, { useState } from 'react';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseHistory } from './ExpenseHistory';
import { useTheme } from '@shared/components/ThemeProvider';
import { User } from '@shared/types/user.types';
import { Expense } from '@shared/types/api.types';

type SubTab = 'add' | 'history';

interface ExpensePanelProps {
  currentUser: User;
  onExpenseCreated?: (expense: Expense) => void;
  onExpenseUpdated?: () => void;
}

export const ExpensePanel: React.FC<ExpensePanelProps> = ({ currentUser, onExpenseCreated, onExpenseUpdated }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('add');
  const { isDark } = useTheme();

  const getTabStyle = (tab: SubTab) => ({
    padding: '8px 16px',
    backgroundColor: activeSubTab === tab 
      ? (isDark ? '#3d3d3d' : '#007bff') 
      : (isDark ? '#2d2d2d' : '#f8f9fa'),
    color: activeSubTab === tab 
      ? 'white' 
      : (isDark ? '#fff' : '#000'),
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px 4px 0 0',
    marginRight: '4px',
  });

  return (
    <div className="p-4">
      <div className="mb-4 border-b border-gray-200">
        <button
          style={getTabStyle('add')}
          onClick={() => setActiveSubTab('add')}
        >
          Adicionar Despesa
        </button>
        <button
          style={getTabStyle('history')}
          onClick={() => setActiveSubTab('history')}
        >
          Histórico
        </button>
      </div>

      <div className="mt-4">
        {activeSubTab === 'add' ? (
          <ExpenseForm 
            currentUser={currentUser}
            onExpenseCreated={(expense) => onExpenseCreated?.(expense)}
          />
        ) : (
          <ExpenseHistory 
            currentUser={currentUser}
            onExpenseUpdated={() => onExpenseUpdated?.()}
          />
        )}
      </div>
    </div>
  );
};
