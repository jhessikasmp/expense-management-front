import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useTheme } from './ThemeProvider';

interface FundEntry {
  _id?: string;
  userId: string;
  name: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  createdAt?: Date;
}

interface EmergencyFundProps {
  currentUser: User;
}

export const EmergencyFund: React.FC<EmergencyFundProps> = ({ currentUser }) => {
  const [entries, setEntries] = useState<FundEntry[]>([]);

  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('emergencyFundEntries') || '[]');
    setEntries(savedEntries);
  }, []);

  const saveEntries = (newEntries: FundEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('emergencyFundEntries', JSON.stringify(newEntries));
  };
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    customDate: ''
  });
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: FundEntry = {
      ...formData,
      userId: currentUser._id!,
      type: 'expense',
      amount: -Math.abs(Number(formData.amount)),
      createdAt: formData.customDate ? new Date(formData.customDate) : new Date()
    };
    
    const newEntries = [...entries, newEntry];
    saveEntries(newEntries);
    setFormData({ name: '', description: '', amount: '', customDate: '' });
  };

  const totalBalance = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalIncome = entries.filter(e => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = Math.abs(entries.filter(e => e.amount < 0).reduce((sum, e) => sum + e.amount, 0));

  const formStyle = {
    marginBottom: '20px',
    padding: '25px',
    backgroundColor: isDark ? '#2d2d2d' : '#e8f5e8',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    margin: '8px 0',
    border: `2px solid ${isDark ? '#555' : '#c3e6cb'}`,
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: isDark ? '#3d3d3d' : 'white',
    color: isDark ? 'white' : 'black'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px', 
        marginBottom: '20px' 
      }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: isDark ? '#166534' : '#d4edda',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4>Saldo Total</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: totalBalance >= 0 ? '#28a745' : '#dc3545' }}>
            €{totalBalance.toFixed(2)}
          </p>
        </div>
        <div style={{ 
          padding: '20px', 
          backgroundColor: isDark ? '#3d3d3d' : '#e3f2fd',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4>Entradas</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
            €{totalIncome.toFixed(2)}
          </p>
        </div>
        <div style={{ 
          padding: '20px', 
          backgroundColor: isDark ? '#4a2d2d' : '#f8d7da',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4>Gastos</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
            €{totalExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>
        <h3 style={{ marginBottom: '20px', color: isDark ? '#28a745' : '#155724' }}>
          Fundo de Emergência - {currentUser.name}
        </h3>
        


        <div>
          <input
            type="text"
            placeholder="Nome (ex: Reserva Mensal, Conserto Urgente)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Descrição detalhada"
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
            placeholder="Valor"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            style={inputStyle}
            required
          />
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

        <button type="submit" style={buttonStyle}>
          Adicionar Gasto de Emergência
        </button>
      </form>

      <div>
        <h3>Histórico</h3>
        {entries.map((entry, index) => (
          <div key={index} style={{ 
            padding: '15px', 
            backgroundColor: isDark ? '#3d3d3d' : 'white',
            borderRadius: '6px',
            marginBottom: '10px',
            border: `1px solid ${isDark ? '#555' : '#ddd'}`,
            borderLeft: `4px solid ${entry.amount > 0 ? '#28a745' : '#dc3545'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{entry.name}</strong>
                <p style={{ margin: '5px 0', fontSize: '14px', color: isDark ? '#ccc' : '#666' }}>
                  {entry.description}
                </p>
                <small style={{ color: isDark ? '#aaa' : '#888' }}>
                  {currentUser.name}
                </small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ 
                  margin: '0', 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: entry.amount > 0 ? '#28a745' : '#dc3545'
                }}>
                  {entry.amount > 0 ? '+' : ''}€{entry.amount.toFixed(2)}
                </p>
                <small style={{ color: entry.amount > 0 ? '#28a745' : '#dc3545' }}>
                  {entry.amount > 0 ? 'Entrada' : 'Gasto'}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};