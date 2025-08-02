import React, { useState } from 'react';
import { Expense, User } from '../types';
import { expenseService, fundService } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import { ExpenseHistory } from './ExpenseHistory';

interface ExpenseFormProps {
  currentUser: User;
  onExpenseCreated: (expense: Expense) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ currentUser, onExpenseCreated }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    category: 'supermercado',
    customDate: ''
  });
  const [showHistory, setShowHistory] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Criar despesa normal
      const expenseData = {
        ...formData,
        userId: currentUser._id!,
        amount: -Math.abs(Number(formData.amount)),
        currency: 'EUR',
        createdAt: formData.customDate ? new Date(formData.customDate) : new Date()
      };
      
      // Remove customDate do objeto antes de enviar
      const { customDate, ...cleanExpenseData } = expenseData;
      const response = await expenseService.create(cleanExpenseData);

      // Se for categoria especial, adicionar entrada no fundo correspondente
      await handleSpecialCategory(formData.category, formData.amount, formData.customDate);
      
      onExpenseCreated(response.data);
      setFormData({ name: '', description: '', amount: '', category: 'supermercado', customDate: '' });
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
    }
  };

  const handleSpecialCategory = async (category: string, amount: string, customDate: string) => {
    const fundEntry = {
      userId: currentUser._id!,
      name: `Transferência: ${formData.name}`,
      description: `Auto-transferência de despesa: ${formData.description}`,
      amount: Math.abs(Number(amount)),
      type: 'income' as const,
      createdAt: customDate ? new Date(customDate) : new Date()
    };

    try {
      let fundCategory = '';
      switch (category) {
        case 'fundo_viagem':
          fundCategory = 'travel';
          break;
        case 'fundo_emergencia':
          fundCategory = 'emergency';
          break;
        case 'reserva_carro':
          fundCategory = 'car';
          break;
        case 'mesada':
          fundCategory = 'allowance';
          break;
        case 'investimentos':
          fundCategory = 'investment';
          fundEntry.name = `Reserva para Investimentos: ${formData.name}`;
          fundEntry.description = `Valor reservado para investimentos: ${formData.description}`;
          break;
      }
      
      if (fundCategory) {
        await fundService.create({
          ...fundEntry,
          category: fundCategory
        });
      }
    } catch (error) {
      console.error('Erro ao processar categoria especial:', error);
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
    { value: 'cursos', label: 'Cursos' },
    { value: 'outros', label: 'Outros' },

  ];

  const formStyle = {
    marginBottom: '20px'
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
    <div className="space-y-6">
      <h2>Despesas</h2>
      
      {/* Formulário existente */}
      <form onSubmit={handleSubmit} style={formStyle}>
        <h3 style={{ marginBottom: '20px', color: '#dc3545' }}>Adicionar Despesa - {currentUser.name}</h3>

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
            placeholder="Descrição da despesa (opcional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <input
            type="number"
            step="0.01"
            placeholder="Valor (será automaticamente negativo)"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
        <div>
          <input
            type="date"
            value={formData.customDate}
            onChange={(e) => setFormData({ ...formData, customDate: e.target.value })}
            style={inputStyle}
            placeholder="Data (opcional - padrão: hoje)"
            min="2020-01-01"
            max="2030-12-31"
          />
        </div>
        <button type="submit" style={buttonStyle}>Adicionar Despesa</button>
      </form>

      {/* Botão para mostrar/esconder histórico */}
      <button
        type="button"
        onClick={() => setShowHistory(!showHistory)}
        style={{
          padding: '8px 16px',
          backgroundColor: isDark ? '#3d3d3d' : '#f0f0f0',
          color: isDark ? '#fff' : '#000',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px'
        }}
      >
        <span>Histórico de Despesas</span>
        <span>{showHistory ? '▼' : '▶'}</span>
      </button>

      {/* Painel de histórico */}
      {showHistory && (
        <div style={{
          marginTop: '10px',
          padding: '15px',
          backgroundColor: isDark ? '#2d2d2d' : '#fff',
          borderRadius: '8px'
        }}>
          <ExpenseHistory 
            currentUser={currentUser}
            onExpenseUpdated={() => {}}
          />
        </div>
      )}
    </div>
  );
};
