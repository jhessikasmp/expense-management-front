import React, { useState, useEffect } from 'react';
import { Investment } from '../types';
import { investmentService, expenseService } from '../services/api';
import { useTheme } from './ThemeProvider';
import { convertToEUR, getCurrencySymbol } from '../utils/currencyConverter';

interface InvestmentWithPrice extends Investment {
  currentPrice: number;
  totalValue: number;
  profit: number;
  error?: string;
}

export const InvestmentPanel: React.FC = () => {
  const [investments, setInvestments] = useState<InvestmentWithPrice[]>([]);
  const [monthlyInvestments, setMonthlyInvestments] = useState<any[]>([]);
  const { isDark } = useTheme();

  const loadBasicInvestments = async () => {
    try {
      const [investmentsRes, expensesRes] = await Promise.all([
        investmentService.list(),
        expenseService.list()
      ]);
      // Aportes mensais (despesas com categoria investimentos)
      const investmentExpenses = expensesRes.data.filter(exp => exp.category === 'investimentos');
      setMonthlyInvestments(investmentExpenses);
      const investmentsData = investmentsRes.data.map((inv: Investment) => ({
        ...inv,
        currentPrice: inv.unitPrice,
        totalValue: inv.quantity * inv.unitPrice,
        profit: 0
      }));
      setInvestments(investmentsData);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
    }
  };


  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este investimento?')) {
      try {
        await investmentService.delete(id);
        loadBasicInvestments();
      } catch (error) {
        console.error('Erro ao excluir investimento:', error);
      }
    }
  };

  useEffect(() => {
    loadBasicInvestments();
  }, []);
  
  const totalMonthlyInvestedEUR = monthlyInvestments.reduce((sum, expense) => {
    return sum + convertToEUR(Math.abs(expense.amount), expense.currency || 'EUR');
  }, 0);
  const totalCurrentValueEUR = investments.reduce((sum, inv) => {
    return sum + convertToEUR(inv.totalValue, inv.currency || 'EUR');
  }, 0);

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Investimentos</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <div style={{ 
          padding: '15px', 
          backgroundColor: isDark ? '#3d3d3d' : '#e3f2fd',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <h4>Aportes Mensais</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>€{totalMonthlyInvestedEUR.toFixed(2)}</p>
        </div>
        <div style={{ 
          padding: '15px', 
          backgroundColor: isDark ? '#3d3d3d' : '#e8f5e8',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <h4>Valor Total Investido (em EUR)</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>€{totalCurrentValueEUR.toFixed(2)}</p>
        </div>
      </div>
      <div>
        <h4>Lista de Investimentos</h4>
        {investments.length === 0 ? (
          <p style={{ color: isDark ? '#ccc' : '#666', textAlign: 'center', padding: '20px' }}>
            Nenhum investimento encontrado. Verifique se os dados foram inseridos na collection 'investments'.
          </p>
        ) : (
          <div>
            {investments.map(investment => {
              const symbol = getCurrencySymbol(investment.currency);
              return (
                <div key={investment._id} style={{
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
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{investment.asset}</div>
                    <div style={{ fontSize: '12px', color: isDark ? '#ccc' : '#666', margin: '2px 0' }}>
                      {investment.quantity} × {symbol}{investment.unitPrice.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '11px', color: isDark ? '#aaa' : '#888' }}>
                      {investment.description}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {symbol}{investment.totalValue.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '10px', color: isDark ? '#aaa' : '#888' }}>
                      (€{convertToEUR(investment.totalValue, investment.currency).toFixed(2)} EUR)
                    </div>
                    <div style={{ fontSize: '10px', color: isDark ? '#aaa' : '#888' }}>
                      {new Date(investment.createdAt!).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div>
                    <button onClick={() => handleDelete(investment._id!)} style={{ padding: '3px 6px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', fontSize: '11px' }}>
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};