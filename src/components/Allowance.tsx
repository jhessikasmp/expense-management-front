import React, { useState, useEffect } from 'react';
import type { User } from '@shared/types/user.types';
import type { FundEntry } from '@shared/types/core.types';
import { fundService } from '@shared/services/api';
import { useTheme } from '@shared/components/ThemeProvider';

interface AllowanceProps {
  currentUser: User;
}

export const Allowance: React.FC<AllowanceProps> = ({ currentUser }) => {
  const [entries, setEntries] = useState<FundEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const response = await fundService.list(currentUser._id, 'allowance');
      setEntries(response.data);
    } catch (error) {
      console.error('Erro ao carregar entradas:', error);
    }
  };

  const saveEntry = async (newEntry: FundEntry) => {
    try {
      await fundService.create({
        ...newEntry,
        category: 'allowance'
      });
      loadEntries();
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
    }
  };
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    customDate: ''
  });
  const [selectedType, setSelectedType] = useState<string>('');
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: FundEntry = {
      userId: currentUser._id!,
      type: 'expense',
      amount: -Math.abs(Number(formData.amount)),
      name: formData.name,
      description: formData.description,
      category: 'allowance',
      createdAt: formData.customDate ? new Date(formData.customDate) : new Date()
    };
    
    await saveEntry(newEntry);
    setFormData({ name: '', description: '', amount: '', customDate: '' });
  };

  const totalBalance = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalIncome = entries.filter(e => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = Math.abs(entries.filter(e => e.amount < 0).reduce((sum, e) => sum + e.amount, 0));

  const formStyle = {
    marginBottom: '20px',
    padding: '25px',
    backgroundColor: isDark ? '#2d2d2d' : '#fff3e0',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    margin: '8px 0',
    border: `2px solid ${isDark ? '#555' : '#ffcc80'}`,
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: isDark ? '#3d3d3d' : 'white',
    color: isDark ? 'white' : 'black'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#ff9800',
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
          backgroundColor: isDark ? '#e65100' : '#fff3e0',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4>Saldo Total</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: totalBalance >= 0 ? '#ff9800' : '#dc3545' }}>
            €{totalBalance.toFixed(2)}
          </p>
        </div>
        <div style={{ 
          padding: '20px', 
          backgroundColor: isDark ? '#3d3d3d' : '#e8f5e8',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4>Entradas</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
            €{totalIncome.toFixed(2)}
          </p>
        </div>
        <div style={{ 
          padding: '20px', 
          backgroundColor: isDark ? '#4a2d2d' : '#f8d7da',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4>Gastos Pessoais</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
            €{totalExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>
        <h3 style={{ marginBottom: '20px', color: isDark ? '#ff9800' : '#e65100' }}>
          Mesada - {currentUser.name}
        </h3>
        


        <div>
          <input
            type="text"
            placeholder="Nome (ex: Mesada Mensal, Compras Pessoais, Lazer)"
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
          Adicionar Gasto Pessoal
        </button>
      </form>

      <div>
        <h3>Histórico</h3>
        {['Entradas', 'Saídas'].map(type => {
          const typeEntries = entries.filter(entry => 
            type === 'Entradas' ? entry.amount > 0 : entry.amount < 0
          );
          const isOpen = selectedType === type;
          const totalType = typeEntries.reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
          
          return (
            <div key={type} style={{
              marginBottom: '10px',
              border: `1px solid ${isDark ? '#555' : '#ddd'}`,
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => setSelectedType(isOpen ? '' : type)}
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
                <span>{type} ({typeEntries.length})</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: type === 'Entradas' ? '#ff9800' : '#dc3545' }}>
                    €{totalType.toFixed(2)}
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
                  {typeEntries.map((entry, index) => (
                    <div key={index} style={{
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
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>{entry.name}</div>
                        <div style={{ fontSize: '12px', color: isDark ? '#ccc' : '#666', margin: '2px 0' }}>
                          {entry.description}
                        </div>
                        <div style={{ fontSize: '11px', color: isDark ? '#aaa' : '#888' }}>
                          {currentUser.name}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: entry.amount > 0 ? '#ff9800' : '#dc3545', marginLeft: '10px' }}>
                        {entry.amount > 0 ? '+' : ''}€{entry.amount.toFixed(2)}
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
  );
};