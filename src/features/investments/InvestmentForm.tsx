import React, { useState } from 'react';
import { Investment, User } from '../types';
import { investmentService } from '../services/api';
import { useTheme } from './ThemeProvider';
import { exchangeRates } from '../utils/currencyConverter';

interface InvestmentFormProps {
  currentUser: User;
  onInvestmentCreated: (investment: Investment) => void;
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({ currentUser, onInvestmentCreated }) => {
  const [formData, setFormData] = useState({
    asset: '',
    quantity: '',
    unitPrice: '',
    currency: 'EUR',
    description: '',
    customDate: ''
  });
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const investmentData = {
        ...formData,
        userId: currentUser._id!,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice)
      };
      
      // Remove customDate do objeto antes de enviar
      const { customDate, ...cleanInvestmentData } = investmentData;
      const response = await investmentService.create(cleanInvestmentData);
      onInvestmentCreated(response.data);
      setFormData({ asset: '', quantity: '', unitPrice: '', currency: 'EUR', description: '', customDate: '' });
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
      <h3>Adicionar Investimento - {currentUser.name}</h3>
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
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
          style={inputStyle}
          required
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Descrição (opcional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={inputStyle}
        />
      </div>
      <div>
        <select
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          style={inputStyle}
        >
          <option value="EUR">Euro (EUR) - Moeda Base</option>
          <option value="USD">Dólar (USD) - Taxa: {(1/exchangeRates.USD).toFixed(2)} EUR</option>
          <option value="GBP">Libra (GBP) - Taxa: {(1/exchangeRates.GBP).toFixed(2)} EUR</option>
          <option value="BRL">Real (BRL) - Taxa: {(1/exchangeRates.BRL).toFixed(2)} EUR</option>
        </select>
        <div style={{ 
          fontSize: '12px', 
          color: isDark ? '#bbb' : '#666', 
          marginTop: '5px',
          padding: '5px',
          backgroundColor: isDark ? '#3a3a3a' : '#f0f0f0',
          borderRadius: '4px'
        }}>
          Nota: Todos os valores serão convertidos para Euro (€) no dashboard para cálculos consistentes.
        </div>
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