import React, { useState } from 'react';
import { User } from '../types';
import { userService } from '../services/api';
import { useTheme } from './ThemeProvider';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (isRegistering) {
        const response = await userService.create({
          name: name.trim(),
          currency: 'EUR'
        });
        onLogin(response.data);
      } else {
        const response = await userService.list();
        const user = response.data.find(u => u.name.toLowerCase() === name.toLowerCase());
        if (user) {
          onLogin(user);
        } else {
          alert('Usuário não encontrado. Clique em "Registrar" para criar uma conta.');
        }
      }
    } catch (error: any) {
      console.error('Erro completo:', error);
      console.error('Response:', error.response);
      console.error('Response data:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao processar solicitação';
      alert(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    padding: '20px'
  };

  const formStyle = {
    backgroundColor: isDark ? '#2d2d2d' : 'white',
    padding: window.innerWidth <= 768 ? '20px' : '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center' as const
  };

  const inputStyle = {
    width: '100%',
    padding: '15px',
    margin: '15px 0',
    border: `2px solid ${isDark ? '#555' : '#ddd'}`,
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: isDark ? '#3d3d3d' : 'white',
    color: isDark ? 'white' : 'black'
  };

  const buttonStyle = {
    width: '100%',
    padding: '15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: loading ? 'not-allowed' : 'pointer',
    marginBottom: '15px'
  };

  const linkStyle = {
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline'
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#007bff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            JS
          </div>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            color: isDark ? 'white' : '#333',
            fontSize: window.innerWidth <= 768 ? '24px' : '28px'
          }}>
            JS FinanceApp
          </h1>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            color: isDark ? '#ccc' : '#666',
            fontSize: window.innerWidth <= 768 ? '18px' : '20px',
            fontWeight: 'normal'
          }}>
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </h2>
        </div>
        
        <input
          type="text"
          placeholder="Digite seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          required
        />
        
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Processando...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
        </button>
        
        <p style={{ color: isDark ? '#ccc' : '#666' }}>
          {isRegistering ? 'Já tem conta? ' : 'Não tem conta? '}
          <span 
            style={linkStyle}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Entrar' : 'Registrar'}
          </span>
        </p>
      </form>
    </div>
  );
};