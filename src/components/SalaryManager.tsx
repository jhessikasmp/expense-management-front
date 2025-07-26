import React, { useState } from 'react';
import { User } from '../types';
import { userService } from '../services/api';
import { useTheme } from './ThemeProvider';

interface SalaryManagerProps {
  currentUser: User;
  onSalaryUpdated: (user: User) => void;
}

export const SalaryManager: React.FC<SalaryManagerProps> = ({ currentUser, onSalaryUpdated }) => {
  const [salary, setSalary] = useState(currentUser.salary);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await userService.update(currentUser._id!, { salary });
      onSalaryUpdated(response.data);
    } catch (error) {
      console.error('Erro ao atualizar salário:', error);
    } finally {
      setLoading(false);
    }
  };

  const formStyle = {
    padding: '25px',
    backgroundColor: isDark ? '#2d2d2d' : '#f0f8ff',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    margin: '10px 0',
    border: `2px solid ${isDark ? '#555' : '#b3d9ff'}`,
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: isDark ? '#3d3d3d' : 'white',
    color: isDark ? 'white' : 'black'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3 style={{ marginBottom: '20px', color: isDark ? '#007bff' : '#0056b3' }}>
        Definir Salário - {currentUser.name}
      </h3>
      
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: isDark ? '#fff' : '#333' }}>
          Salário Mensal:
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="Digite seu salário mensal"
          value={salary}
          onChange={(e) => setSalary(Number(e.target.value))}
          style={inputStyle}
          required
        />
      </div>
      
      <button type="submit" style={buttonStyle} disabled={loading}>
        {loading ? 'Atualizando...' : 'Atualizar Salário'}
      </button>
    </form>
  );
};