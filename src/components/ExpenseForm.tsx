import React, { useState } from 'react';
import { Expense, User } from '../types';
import { expenseService } from '../services/api';

interface ExpenseFormProps {
  users: User[];
  onExpenseCreated: (expense: Expense) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ users, onExpenseCreated }) => {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    description: '',
    amount: 0,
    category: 'alimentacao'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await expenseService.create({
        ...formData,
        amount: -Math.abs(formData.amount),
        currency: 'EUR'
      });
      onExpenseCreated(response.data);
      setFormData({ userId: '', name: '', description: '', amount: 0, category: 'alimentacao' });
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
    }
  };

  const categories = [
    { value: 'alimentacao', label: 'Alimentação' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'moradia', label: 'Moradia' },
    { value: 'saude', label: 'Saúde' },
    { value: 'educacao', label: 'Educação' },
    { value: 'lazer', label: 'Lazer' },
    { value: 'roupas', label: 'Roupas' },
    { value: 'outros', label: 'Outros' }
  ];

  const formStyle = {
    marginBottom: '20px',
    padding: '25px',
    backgroundColor: '#fff5f5',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    margin: '8px 0',
    border: '2px solid #fecaca',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3 style={{ marginBottom: '20px', color: '#dc3545' }}>Adicionar Despesa</h3>
      <div>
        <select
          value={formData.userId}
          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
          style={inputStyle}
          required
        >
          <option value="">Selecionar Usuário</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>{user.name}</option>
          ))}
        </select>
      </div>
      <div>
        <input
          type="text"
          placeholder="Nome da despesa"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={inputStyle}
          required
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Descrição da despesa"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={inputStyle}
          required
        />
      </div>
      <div>
        <input
          type="number"
          step="0.01"
          placeholder="Valor (será automaticamente negativo)"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          style={inputStyle}
          required
        />
      </div>
      <div>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          style={inputStyle}
          required
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>
      <button type="submit" style={buttonStyle}>Adicionar Despesa</button>
    </form>
  );
};