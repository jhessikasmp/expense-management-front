import React, { useState, useEffect } from 'react';
import { Investment } from '../types';
import { investmentService } from '../services/api';
import { useTheme } from './ThemeProvider';

interface InvestmentWithPrice extends Investment {
  currentPrice: number;
  totalValue: number;
  profit: number;
  error?: string;
}

export const InvestmentPanel: React.FC = () => {
  const [investments, setInvestments] = useState<InvestmentWithPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  const loadBasicInvestments = async () => {
    try {
      console.log('Carregando investimentos...');
      const response = await investmentService.list();
      console.log('Response:', response);
      console.log('Data:', response.data);
      
      const investmentsData = response.data.map((inv: Investment) => ({
        ...inv,
        currentPrice: inv.unitPrice,
        totalValue: inv.quantity * inv.unitPrice,
        profit: 0
      }));
      
      console.log('Investments processed:', investmentsData);
      setInvestments(investmentsData);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
    }
  };

  const updatePrices = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://expense-management-back.onrender.com/api/dashboard/investments-prices');
      const data = await response.json();
      setInvestments(data);
    } catch (error) {
      console.error('Erro ao atualizar preços:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBasicInvestments();
  }, []);

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.quantity * inv.unitPrice), 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalProfit = totalCurrent - totalInvested;

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Investimentos</h3>
        <button 
          onClick={updatePrices} 
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: isDark ? '#4a90e2' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Atualizando...' : 'Atualizar Preços'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ 
          padding: '15px', 
          backgroundColor: isDark ? '#3d3d3d' : '#e3f2fd',
          borderRadius: '6px' 
        }}>
          <h4>Total Investido</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>€{totalInvested.toFixed(2)}</p>
        </div>
        <div style={{ 
          padding: '15px', 
          backgroundColor: isDark ? '#3d3d3d' : '#e8f5e8',
          borderRadius: '6px' 
        }}>
          <h4>Valor Atual</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>€{totalCurrent.toFixed(2)}</p>
        </div>
        <div style={{ 
          padding: '15px', 
          backgroundColor: totalProfit >= 0 ? (isDark ? '#2d4a2d' : '#d4edda') : (isDark ? '#4a2d2d' : '#f8d7da'),
          borderRadius: '6px' 
        }}>
          <h4>Lucro/Prejuízo</h4>
          <p style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            color: totalProfit >= 0 ? '#28a745' : '#dc3545'
          }}>
            €{totalProfit.toFixed(2)}
          </p>
        </div>
      </div>

      <div>
        <h4>Detalhes dos Investimentos</h4>
        {investments.length === 0 ? (
          <p style={{ color: isDark ? '#ccc' : '#666', textAlign: 'center', padding: '20px' }}>
            Nenhum investimento encontrado. Verifique se os dados foram inseridos na collection 'investments'.
          </p>
        ) : (
          investments.map(investment => (
          <div key={investment._id} style={{ 
            padding: '15px', 
            backgroundColor: isDark ? '#3d3d3d' : 'white',
            borderRadius: '6px',
            marginBottom: '10px',
            border: `1px solid ${isDark ? '#555' : '#ddd'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{investment.asset}</strong>
                <p style={{ margin: '5px 0', fontSize: '14px', color: isDark ? '#ccc' : '#666' }}>
                  {investment.quantity} unidades × €{investment.unitPrice} | {investment.description}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                  €{investment.totalValue.toFixed(2)}
                </p>
                <small style={{ color: isDark ? '#aaa' : '#888' }}>
                  {new Date(investment.createdAt!).toLocaleDateString('pt-BR')}
                </small>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};