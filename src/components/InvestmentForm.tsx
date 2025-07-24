import React, { useState } from 'react';
import { Investment, User } from '../types';
import { investmentService } from '../services/api';
import { useTheme } from './ThemeProvider';

interface InvestmentFormProps {
  users: User[];
  onInvestmentCreated: (investment: Investment) => void;
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({ users, onInvestmentCreated }) => {
  const [formData, setFormData] = useState({
    userId: '',
    asset: '',
    quantity: 0,
    unitPrice: 0,
    currency: 'EUR'
  });
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await investmentService.create(formData);
      onInvestmentCreated(response.data);
      setFormData({ userId: '', asset: '', quantity: 0, unitPrice: 0, currency: 'EUR' });
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    margin: '5px 0',
    border: `1px solid ${isDark ? '#555' : '#ddd'}`,
    borderRadius: '4px',
    backgroundColor: isDark ? '#3d3d3d' : 'white',
    color: isDark ? 'white' : 'black',
    fontSize: '16px'
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      marginBottom: '20px', 
      padding: '20px', 
      backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
      borderRadius: '8px'
    }}>
      <h3>Adicionar Investimento</h3>
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
          placeholder="Código do ativo (ex: AAPL, BTC, TSLA)"
          value={formData.asset}
          onChange={(e) => setFormData({ ...formData, asset: e.target.value.toUpperCase() })}
          style={inputStyle}
          required
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: isDark ? '#fff' : '#333' }}>
          Quantidade:
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="Quantas unidades você possui?"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
          style={inputStyle}
          required
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: isDark ? '#fff' : '#333' }}>
          Preço de Compra:
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="Preço que você pagou por unidade"
          value={formData.unitPrice}
          onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
          style={inputStyle}
          required
        />
      </div>
      <div>
        <select
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          style={inputStyle}
        >
          <option value="EUR">Em que moeda? - EUR</option>
          <option value="USD">Em que moeda? - USD</option>
          <option value="GBP">Em que moeda? - GBP</option>
          <option value="BRL">Em que moeda? - BRL</option>
        </select>
      </div>
      <button type="submit" style={{
        padding: '12px 24px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px'
      }}>
        Adicionar Investimento
      </button>
    </form>
  );
};