import React, { useState, useEffect } from 'react';
import { TravelFund, User } from '../types';
import { travelFundService } from '../services/api';
import { useTheme } from './ThemeProvider';

interface TravelFundPanelProps {
  users: User[];
}

export const TravelFundPanel: React.FC<TravelFundPanelProps> = ({ users }) => {
  const [funds, setFunds] = useState<TravelFund[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    participants: [{ userId: '', contribution: 0 }],
    currency: 'EUR'
  });
  const { isDark } = useTheme();

  useEffect(() => {
    loadFunds();
  }, []);

  const loadFunds = async () => {
    try {
      const response = await travelFundService.list();
      setFunds(response.data);
    } catch (error) {
      console.error('Erro ao carregar fundos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const total = formData.participants.reduce((sum, p) => sum + p.contribution, 0);
      await travelFundService.create({
        name: formData.name,
        participants: formData.participants.filter(p => p.userId && p.contribution > 0),
        total,
        currency: formData.currency
      });
      setFormData({ name: '', participants: [{ userId: '', contribution: 0 }], currency: 'EUR' });
      loadFunds();
    } catch (error) {
      console.error('Erro ao criar fundo:', error);
    }
  };

  const addParticipant = () => {
    setFormData({
      ...formData,
      participants: [...formData.participants, { userId: '', contribution: 0 }]
    });
  };

  const updateParticipant = (index: number, field: string, value: any) => {
    const updated = formData.participants.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    );
    setFormData({ ...formData, participants: updated });
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

  const totalFunds = funds.reduce((sum, fund) => sum + fund.total, 0);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        padding: '20px',
        backgroundColor: isDark ? '#2d2d2d' : '#f0fff0',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Total em Fundos de Viagem</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>€{totalFunds.toFixed(2)}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h3>Criar Fundo de Viagem</h3>
        <div>
          <input
            type="text"
            placeholder="Nome do fundo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="BRL">BRL</option>
          </select>
        </div>
        
        <h4>Participantes</h4>
        {formData.participants.map((participant, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <select
              value={participant.userId}
              onChange={(e) => updateParticipant(index, 'userId', e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            >
              <option value="">Selecionar usuário</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Contribuição"
              value={participant.contribution}
              onChange={(e) => updateParticipant(index, 'contribution', parseFloat(e.target.value) || 0)}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        ))}
        
        <button type="button" onClick={addParticipant} style={{
          padding: '8px 16px',
          backgroundColor: isDark ? '#4a90e2' : '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px'
        }}>
          + Participante
        </button>
        
        <button type="submit" style={{
          padding: '12px 24px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          Criar Fundo
        </button>
      </form>

      <div>
        <h3>Fundos Existentes</h3>
        {funds.map(fund => (
          <div key={fund._id} style={{ 
            padding: '15px', 
            backgroundColor: isDark ? '#3d3d3d' : 'white',
            borderRadius: '6px',
            marginBottom: '10px',
            border: `1px solid ${isDark ? '#555' : '#ddd'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{fund.name}</strong>
                <p style={{ margin: '5px 0', fontSize: '14px', color: isDark ? '#ccc' : '#666' }}>
                  {fund.participants.length} participantes
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>
                  {fund.currency} {fund.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};