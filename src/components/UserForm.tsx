import React, { useState } from 'react';
import { User } from '@shared/types/user.types';
import { userService } from '@shared/services/user';

interface UserFormProps {
  onUserCreated: (user: User) => void;
}

export const UserForm: React.FC<UserFormProps> = ({ onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await userService.create({
        ...formData,
        currency: 'EUR'
      });
      const userData = response.data;
      const user: User = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt)
      };
      onUserCreated(user);
      setFormData({ name: '' });
    } catch (error: any) {
      console.error('Erro completo ao criar usuário:', error);
      console.error('Response:', error.response);
      console.error('Response data:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao criar usuário';
      alert(`Erro: ${errorMessage}`);
    }
  };

  const formStyle = {
    marginBottom: '20px',
    padding: '25px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    margin: '10px 0',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease'
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
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3 style={{ marginBottom: '20px', color: '#343a40' }}>Adicionar Usuário</h3>
      <div>
        <input
          type="text"
          placeholder="Nome do usuário"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={inputStyle}
          required
        />
      </div>
      <button type="submit" style={buttonStyle}>Adicionar Usuário</button>
    </form>
  );
};