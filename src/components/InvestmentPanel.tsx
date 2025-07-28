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
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [monthlyInvestments, setMonthlyInvestments] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
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
      
      // Adicionar alerta para informar o usuário sobre a API removida
      alert('API Alpha Vantage foi removida. Preços exibidos são os mesmos armazenados no sistema.');
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
  
  const totalMonthlyInvestedEUR = monthlyInvestments.reduce((sum, expense) => {
    return sum + convertToEUR(Math.abs(expense.amount), expense.currency || 'EUR');
  }, 0);
  
  const totalCurrentValueEUR = investments.reduce((sum, inv) => {
    return sum + convertToEUR(inv.totalValue, inv.currency || 'EUR');
  }, 0);
  
  const totalProfitEUR = totalCurrentValueEUR - totalMonthlyInvestedEUR;

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
          <h4>Valor Atual</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>€{totalCurrentValueEUR.toFixed(2)}</p>
        </div>
        <div style={{ 
          padding: '15px', 
          backgroundColor: totalProfitEUR >= 0 ? (isDark ? '#2d4a2d' : '#d4edda') : (isDark ? '#4a2d2d' : '#f8d7da'),
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <h4>Lucro/Prejuízo</h4>
          <p style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            color: totalProfitEUR >= 0 ? '#28a745' : '#dc3545'
          }}>
            {totalProfitEUR >= 0 ? '+' : ''}€{totalProfitEUR.toFixed(2)}
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
          <div>
            {Object.entries(
              investments.reduce((acc, inv) => {
                let type = 'Outros';
                if (inv.asset.includes('BTC') || inv.asset.includes('ETH') || inv.asset.includes('BNB') || inv.asset.includes('SOL') || inv.asset.includes('NEAR')) {
                  type = 'Criptomoedas';
                } else if (inv.description?.toLowerCase().includes('etf') || inv.asset.includes('VWCE') || inv.asset.includes('GLUX') || inv.asset.includes('HLQD')) {
                  type = 'ETFs';
                } else if (inv.description?.toLowerCase().includes('fundo') || inv.description?.toLowerCase().includes('fund')) {
                  type = 'Fundos';
                } else if (inv.description?.toLowerCase().includes('ação') || inv.asset.includes('ODPV3')) {
                  type = 'Ações';
                }
                if (!acc[type]) acc[type] = [];
                acc[type].push(inv);
                return acc;
              }, {} as Record<string, InvestmentWithPrice[]>)
            ).map(([type, typeInvestments]) => {
              const isOpen = selectedCurrency === type;
              const totalValueEUR = typeInvestments.reduce((sum, inv) => sum + convertToEUR(inv.totalValue, inv.currency || 'EUR'), 0);
              
              return (
                <div key={type} style={{
                  marginBottom: '10px',
                  border: `1px solid ${isDark ? '#555' : '#ddd'}`,
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => setSelectedCurrency(isOpen ? '' : type)}
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
                    <span>{type} ({typeInvestments.length} ativos)</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                        €{totalValueEUR.toFixed(2)}
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
                      {typeInvestments.map(investment => {
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                                <button onClick={() => handleEdit(investment)} style={{ marginRight: '3px', padding: '3px 6px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', fontSize: '11px' }}>
                                  ✏️
                                </button>
                                <button onClick={() => handleDelete(investment._id!)} style={{ padding: '3px 6px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', fontSize: '11px' }}>
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};