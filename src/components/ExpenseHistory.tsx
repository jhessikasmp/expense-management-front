import React, { useState, useEffect } from 'react';
import { Expense, User } from '../types';
import { expenseService, userService } from '../services/api';
import { useTheme } from './ThemeProvider';

interface ExpenseHistoryProps {
  currentUser: User;
  onExpenseUpdated: () => void;
}

export const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({ currentUser, onExpenseUpdated }) => {
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<Expense[]>([]);
  const [previousMonthsExpenses, setPreviousMonthsExpenses] = useState<{ [key: string]: Expense[] }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});
  const [activeTab, setActiveTab] = useState<'current' | 'previous'>('current');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const { isDark } = useTheme();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const [expensesRes, usersRes] = await Promise.all([
        expenseService.list(),
        userService.list()
      ]);
      const expenses = expensesRes.data;
      setUsers(usersRes.data);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const current = expenses.filter(expense => {
        const expenseDate = new Date(expense.createdAt!);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      });
      
      const previous: { [key: string]: Expense[] } = {};
      expenses.filter(expense => {
        const expenseDate = new Date(expense.createdAt!);
        return !(expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear);
      }).forEach(expense => {
        const expenseDate = new Date(expense.createdAt!);
        const monthKey = `${expenseDate.getFullYear()}-${expenseDate.getMonth()}`;
        const monthLabel = expenseDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        if (!previous[monthLabel]) {
          previous[monthLabel] = [];
        }
        previous[monthLabel].push(expense);
      });
      
      setCurrentMonthExpenses(current);
      setPreviousMonthsExpenses(previous);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense._id!);
    setEditForm({
      name: expense.name,
      description: expense.description,
      amount: Math.abs(expense.amount),
      category: expense.category
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    
    try {
      await expenseService.update(editingId, {
        ...editForm,
        amount: -Math.abs(editForm.amount!)
      });
      setEditingId(null);
      setEditForm({});
      loadExpenses();
      onExpenseUpdated();
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await expenseService.delete(id);
        loadExpenses();
        onExpenseUpdated();
      } catch (error) {
        console.error('Erro ao excluir despesa:', error);
      }
    }
  };

  const categories = [
    { value: 'supermercado', label: 'Supermercado' },
    { value: 'combustivel', label: 'Combustivel' },
    { value: 'aluguel', label: 'Aluguel' },
    { value: 'saude', label: 'Saúde' },
    { value: 'doacao', label: 'Doação' },
    { value: 'internet', label: 'Internet' },
    { value: 'netflix', label: 'NetFlix' },
    { value: 'amazon_prime', label: 'Amazon Prime' },
    { value: 'xbox', label: 'Xbox' },
    { value: 'telefone', label: 'Telefone' },
    { value: 'boleto', label: 'Boletos' },
    { value: 'financiamento', label: 'Financiamento' },
    { value: 'cursos', label: 'Cursos' },
    { value: 'outros', label: 'Outros' },
    { value: 'fundo_viagem', label: '✈️ Fundo de Viagem' },
    { value: 'fundo_emergencia', label: '🆘 Fundo de Emergência' },
    { value: 'reserva_carro', label: '🚗 Reserva do Carro' },
    { value: 'mesada', label: '💰 Mesada' },
    { value: 'investimentos', label: '📈 Investimentos' }
  ];

  const inputStyle = {
    padding: '8px',
    border: `1px solid ${isDark ? '#555' : '#ddd'}`,
    borderRadius: '4px',
    backgroundColor: isDark ? '#3d3d3d' : 'white',
    color: isDark ? 'white' : 'black',
    fontSize: '14px'
  };

  const tabStyle = (tab: 'current' | 'previous') => ({
    padding: '10px 20px',
    backgroundColor: activeTab === tab ? '#007bff' : (isDark ? '#3d3d3d' : '#f8f9fa'),
    color: activeTab === tab ? 'white' : (isDark ? '#fff' : '#000'),
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px 4px 0 0',
    marginRight: '5px'
  });

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button style={tabStyle('current')} onClick={() => setActiveTab('current')}>
          Mês Atual
        </button>
        <button style={tabStyle('previous')} onClick={() => setActiveTab('previous')}>
          Meses Anteriores
        </button>
      </div>

      {activeTab === 'current' && (
        <div>
          <h3>Despesas do Mês Atual</h3>
          {currentMonthExpenses.length === 0 ? (
            <p style={{ color: isDark ? '#ccc' : '#666' }}>Nenhuma despesa este mês</p>
          ) : (
            currentMonthExpenses.map(expense => (
              <div key={expense._id} style={{
                padding: '15px',
                backgroundColor: isDark ? '#3d3d3d' : 'white',
                borderRadius: '8px',
                marginBottom: '10px',
                border: `1px solid ${isDark ? '#555' : '#ddd'}`
              }}>
                {editingId === expense._id ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        style={inputStyle}
                        placeholder="Nome"
                      />
                      <input
                        type="text"
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        style={inputStyle}
                        placeholder="Descrição"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.amount || 0}
                        onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                        style={inputStyle}
                        placeholder="Valor"
                      />
                      <select
                        value={editForm.category || ''}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        style={inputStyle}
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <button onClick={handleUpdate} style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Salvar
                      </button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{expense.name}</strong>
                      {expense.description && (
                        <p style={{ margin: '5px 0', fontSize: '14px', color: isDark ? '#ccc' : '#666' }}>
                          {expense.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                        <small style={{ color: isDark ? '#aaa' : '#888' }}>
                          {categories.find(c => c.value === expense.category)?.label} • {users.find(u => u._id === expense.userId)?.name || 'Usuário'}
                        </small>
                        <small style={{ color: isDark ? '#999' : '#777', fontSize: '11px' }}>
                          {new Date(expense.createdAt!).toLocaleDateString('pt-BR')}
                        </small>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                        €{Math.abs(expense.amount).toFixed(2)}
                      </span>
                      <button onClick={() => handleEdit(expense)} style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(expense._id!)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'previous' && (
        <div>
          <h3>Meses Anteriores</h3>
          {Object.keys(previousMonthsExpenses).length === 0 ? (
            <p style={{ color: isDark ? '#ccc' : '#666' }}>Nenhuma despesa em meses anteriores</p>
          ) : (
            <div>
              <div>
                {Object.entries(previousMonthsExpenses).map(([monthLabel, expenses]) => {
                  const isOpen = selectedMonth === monthLabel;
                  const monthTotal = expenses.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
                  
                  return (
                    <div key={monthLabel} style={{
                      marginBottom: '10px',
                      border: `1px solid ${isDark ? '#555' : '#ddd'}`,
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <button
                        onClick={() => setSelectedMonth(isOpen ? '' : monthLabel)}
                        style={{
                          width: '100%',
                          padding: '10px 15px',
                          backgroundColor: isDark ? '#3d3d3d' : '#f8f9fa',
                          color: isDark ? '#fff' : '#000',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <span>{monthLabel}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '13px', color: '#dc3545', fontWeight: 'bold' }}>
                            €{monthTotal.toFixed(2)}
                          </span>
                          <span style={{ fontSize: '10px' }}>
                            {isOpen ? '▲' : '▼'}
                          </span>
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div style={{
                          padding: '10px',
                          backgroundColor: isDark ? '#2d2d2d' : 'white',
                          borderTop: `1px solid ${isDark ? '#555' : '#ddd'}`
                        }}>
                          {expenses.map(expense => (
                            <div key={expense._id} style={{
                              padding: '8px 10px',
                              backgroundColor: isDark ? '#3d3d3d' : '#f8f9fa',
                              borderRadius: '4px',
                              marginBottom: '5px',
                              border: `1px solid ${isDark ? '#555' : '#e9ecef'}`,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '500' }}>{expense.name}</div>
                                {expense.description && (
                                  <div style={{ fontSize: '12px', color: isDark ? '#ccc' : '#666', margin: '2px 0' }}>
                                    {expense.description}
                                  </div>
                                )}
                                <div style={{ fontSize: '11px', color: isDark ? '#aaa' : '#888' }}>
                                  {categories.find(c => c.value === expense.category)?.label} • {users.find(u => u._id === expense.userId)?.name || 'Usuário'}
                                </div>
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc3545', marginLeft: '10px' }}>
                                €{Math.abs(expense.amount).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};