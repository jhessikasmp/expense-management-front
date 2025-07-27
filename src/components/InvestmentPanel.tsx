import React, { useState, useEffect } from 'react';
import { Investment } from '../types';
import { investmentService, expenseService } from '../services/api';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [monthlyInvestments, setMonthlyInvestments] = useState<any[]>([]);
  const { isDark } = useTheme();

  const loadBasicInvestments = async () => {
    try {
      console.log('Carregando investimentos...');
      const [investmentsRes, expensesRes] = await Promise.all([
        investmentService.list(),
        expenseService.list()
      ]);
      
      console.log('Investments Response:', investmentsRes);
      console.log('Expenses Response:', expensesRes);
      
      // Aportes mensais (despesas com categoria investimentos)
      const investmentExpenses = expensesRes.data.filter(exp => exp.category === 'investimentos');
      setMonthlyInvestments(investmentExpenses);
      
      const investmentsData = investmentsRes.data.map((inv: Investment) => ({
        ...inv,
        currentPrice: inv.unitPrice,
        totalValue: inv.quantity * inv.unitPrice,
        profit: 0
      }));
      
      console.log('Investments processed:', investmentsData);
      console.log('Monthly investments:', investmentExpenses);
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

  const handleEdit = (investment: InvestmentWithPrice) => {
    setEditingId(investment._id!);
    setEditForm({
      asset: investment.asset,
      description: investment.description,
      quantity: investment.quantity,
      unitPrice: investment.unitPrice
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await investmentService.update(editingId, editForm);
      setEditingId(null);
      setEditForm({});
      loadBasicInvestments();
    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
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

  const totalsByCurrency = investments.reduce((acc, inv) => {
    const currency = inv.currency || 'EUR';
    if (!acc[currency]) acc[currency] = { monthlyInvested: 0, currentValue: 0 };
    acc[currency].currentValue += inv.totalValue;
    return acc;
  }, {} as Record<string, { monthlyInvested: number; currentValue: number }>);
  
  // Adicionar aportes mensais por moeda
  monthlyInvestments.forEach(expense => {
    const currency = expense.currency || 'EUR';
    if (!totalsByCurrency[currency]) totalsByCurrency[currency] = { monthlyInvested: 0, currentValue: 0 };
    totalsByCurrency[currency].monthlyInvested += Math.abs(expense.amount);
  });

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
        {Object.entries(totalsByCurrency).map(([currency, totals]) => {
          const profit = totals.currentValue - totals.monthlyInvested;
          const symbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';
          
          return (
            <div key={currency} style={{ 
              padding: '15px', 
              backgroundColor: isDark ? '#3d3d3d' : '#f8f9fa',
              borderRadius: '6px',
              border: `2px solid ${currency === 'EUR' ? '#007bff' : currency === 'USD' ? '#28a745' : currency === 'GBP' ? '#6f42c1' : '#ffc107'}`
            }}>
              <h4>{currency}</h4>
              <p style={{ fontSize: '14px', margin: '5px 0' }}>Aportes Mensais: {symbol}{totals.monthlyInvested.toFixed(2)}</p>
              <p style={{ fontSize: '14px', margin: '5px 0' }}>Valor Atual: {symbol}{totals.currentValue.toFixed(2)}</p>
              <p style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: profit >= 0 ? '#28a745' : '#dc3545',
                margin: '5px 0'
              }}>
                {profit >= 0 ? 'Lucro: +' : 'Prejuízo: '}{symbol}{Math.abs(profit).toFixed(2)}
              </p>
            </div>
          );
        })}
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
            {editingId === investment._id ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={editForm.asset || ''}
                    onChange={(e) => setEditForm({ ...editForm, asset: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${isDark ? '#555' : '#ddd'}`, backgroundColor: isDark ? '#2d2d2d' : 'white', color: isDark ? 'white' : 'black' }}
                    placeholder="Ativo"
                  />
                  <input
                    type="text"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${isDark ? '#555' : '#ddd'}`, backgroundColor: isDark ? '#2d2d2d' : 'white', color: isDark ? 'white' : 'black' }}
                    placeholder="Descrição"
                  />
                  <input
                    type="number"
                    value={editForm.quantity || 0}
                    onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                    style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${isDark ? '#555' : '#ddd'}`, backgroundColor: isDark ? '#2d2d2d' : 'white', color: isDark ? 'white' : 'black' }}
                    placeholder="Quantidade"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.unitPrice || 0}
                    onChange={(e) => setEditForm({ ...editForm, unitPrice: Number(e.target.value) })}
                    style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${isDark ? '#555' : '#ddd'}`, backgroundColor: isDark ? '#2d2d2d' : 'white', color: isDark ? 'white' : 'black' }}
                    placeholder="Preço unitário"
                  />
                </div>
                <div>
                  <button onClick={handleUpdate} style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Salvar
                  </button>
                  <button onClick={() => setEditingId(null)} style={{ padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{investment.asset}</strong>
                  <p style={{ margin: '5px 0', fontSize: '14px', color: isDark ? '#ccc' : '#666' }}>
                    {investment.quantity} unidades × {investment.currency === 'BRL' ? 'R$' : investment.currency === 'USD' ? '$' : investment.currency === 'GBP' ? '£' : '€'}{investment.unitPrice} | {investment.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                      {investment.currency === 'BRL' ? 'R$' : investment.currency === 'USD' ? '$' : investment.currency === 'GBP' ? '£' : '€'}{investment.totalValue.toFixed(2)}
                    </p>
                    <small style={{ color: isDark ? '#aaa' : '#888' }}>
                      {new Date(investment.createdAt!).toLocaleDateString('pt-BR')}
                    </small>
                  </div>
                  <div>
                    <button onClick={() => handleEdit(investment)} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(investment._id!)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          ))
        )}
      </div>
    </div>
  );
};