import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { investmentService, expenseService } from '../services/api';

// Interface para os investimentos
interface Investment {
  _id: string | undefined;
  asset: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  createdAt: string;
  yahooSymbol?: string | null;
}

// Interface para os preços atualizados
interface AssetPrice {
  asset: string;
  description: string;
  quantity: number;
  originalPrice: number;
  currentPrice: number | null;
  originalTotal: number;
  currentTotal: number | null;
  currency: string;
  percentChange: number | null;
  error?: string;
}

export const AssetPriceUpdater: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [assetPrices, setAssetPrices] = useState<AssetPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { isDark } = useTheme();
  // Estados para controlar os painéis acordeão
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(0);
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState<number>(0);
  const [totalProfitLossPercentage, setTotalProfitLossPercentage] = useState<number>(0);

  // Função para alternar a abertura/fechamento dos painéis
  const togglePanel = (panelName: string) => {
    setOpenPanel(openPanel === panelName ? null : panelName);
  };

  // Função para detectar automaticamente o símbolo Yahoo Finance com base no asset
  const getYahooSymbol = (asset: string, description: string): string | null => {
    // ETFs Europeus conhecidos
    const knownETFs: Record<string, string> = {
      'CHIP': 'CHIP.PA',  // Paris
      'GLUX': 'GLUX.PA',  // Paris
      'HLQD': 'HLQD.L',   // London
      'INFR': 'INFR.L',   // London
      'SGLD': 'SGLD.L',   // London
      'VWCE': 'VWCE.DE',  // Deutsche Börse
      'XAIX': 'XAIX.DE',  // Deutsche Börse
    };
    
    // Criptomoedas conhecidas
    const knownCryptos: Record<string, string> = {
      'BTC': 'BTC-USD',
      'WBTC': 'BTC-USD',  // Usando BTC como proxy para Wrapped Bitcoin
      'BTCB': 'BTC-USD',  // Usando BTC como proxy para Bitcoin BEP20
      'ETH': 'ETH-USD',
      'WETH': 'ETH-USD',  // Usando ETH como proxy para Wrapped Ethereum
      'NEAR': 'NEAR-USD',
      'BNB': 'BNB-USD',
      'SOL': 'SOL-USD',
      'ADA': 'ADA-USD',
      'MATIC': 'MATIC-USD',
      'DOT': 'DOT-USD',
      'XRP': 'XRP-USD',
      'AVAX': 'AVAX-USD',
    };
    
    // Ações brasileiras conhecidas
    const knownBrazilianStocks: Record<string, string> = {
      'ODPV3': 'ODPV3.SA',
      'PETR4': 'PETR4.SA',
      'VALE3': 'VALE3.SA',
      'ITUB4': 'ITUB4.SA',
      'BBDC4': 'BBDC4.SA',
      'BBAS3': 'BBAS3.SA',
      'WEGE3': 'WEGE3.SA',
    };
    
    // Verificar se é um ativo conhecido
    if (knownETFs[asset]) return knownETFs[asset];
    if (knownCryptos[asset]) return knownCryptos[asset];
    if (knownBrazilianStocks[asset]) return knownBrazilianStocks[asset];
    
    // Regras de detecção automática baseadas no nome e descrição
    
    // ETFs europeus em diferentes bolsas
    if (description.includes('SBF') || description.includes('Paris')) {
      return `${asset}.PA`;  // Paris
    }
    if (description.includes('LSEETF') || description.includes('London')) {
      return `${asset}.L`;  // London
    }
    if (description.includes('IBIS') || description.includes('Deutsche') || description.includes('Xetra')) {
      return `${asset}.DE`;  // Deutsche Börse
    }
    if (description.includes('AMS') || description.includes('Amsterdam')) {
      return `${asset}.AS`;  // Amsterdam
    }
    
    // Ações brasileiras
    if (description.includes('Ação Brasileira') || (asset.length === 5 && (asset.endsWith('3') || asset.endsWith('4')))) {
      return `${asset}.SA`;  // Ações brasileiras (B3)
    }
    
    // Crypto - assumimos que sejam criptomoedas se estiverem em USD
    if (description.includes('Crypto') || description.includes('Cripto') || description.includes('Blockchain')) {
      return `${asset}-USD`;
    }
    
    // Tenta uma aproximação para stocks americanos
    if (asset.length <= 5 && !asset.includes('.')) {
      return asset;  // Provavelmente um ticker da NYSE/NASDAQ
    }
    
    // Se não conseguir identificar, retorna null
    return null;
  };

  // Carregar investimentos e dados mensais quando o componente montar
  useEffect(() => {
    const fetchInvestmentsAndExpenses = async () => {
      setLoading(true);
      try {
        // Carregar investimentos e despesas em paralelo
        const [investmentsRes, expensesRes] = await Promise.all([
          investmentService.list(),
          expenseService.list()
        ]);
        
        const investments = investmentsRes.data;
        const investmentExpenses = expensesRes.data.filter(exp => exp.category === 'investimentos');
        
        // Calcular montante mensal médio
        const monthly = investmentExpenses.reduce((sum, exp) => sum + Math.abs(exp.amount), 0) / 
                        (investmentExpenses.length > 0 ? Math.max(1, Math.ceil(investmentExpenses.length / 12)) : 1);
        setMonthlyInvestment(monthly);
        
        // Adicionar símbolos do Yahoo Finance aos investimentos
        const enhancedInvestments = investments.map((inv: any) => ({
          ...inv,
          yahooSymbol: getYahooSymbol(inv.asset, inv.description)
        }));
        
        setInvestments(enhancedInvestments);
        
        // Calcular valor total investido
        const totalInv = enhancedInvestments.reduce((sum, inv) => sum + (inv.quantity * inv.unitPrice), 0);
        setTotalInvestment(totalInv);
        
        // Inicializar os preços dos ativos com os valores originais
        const initialPrices = enhancedInvestments.map((inv: any) => ({
          asset: inv.asset,
          description: inv.description,
          quantity: inv.quantity,
          originalPrice: inv.unitPrice,
          currentPrice: inv.unitPrice, // Iniciar com o preço original em vez de null
          originalTotal: inv.quantity * inv.unitPrice,
          currentTotal: inv.quantity * inv.unitPrice, // Iniciar com o total original em vez de null
          currency: inv.currency,
          percentChange: 0 // Iniciar com 0% em vez de null
        }));
        
        setAssetPrices(initialPrices);
      } catch (err) {
        console.error('Erro ao carregar investimentos:', err);
        setError('Falha ao carregar investimentos. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvestmentsAndExpenses();
  }, []);

  // Função para buscar preço atual via Yahoo Finance API
  const fetchCurrentPrice = async (symbol: string): Promise<number | null> => {
    try {
      if (!symbol) return null;
      
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`);
      const data = await response.json();
      
      const quote = data?.chart?.result?.[0];
      if (!quote) {
        throw new Error(`Dados não encontrados para ${symbol}`);
      }
      
      return quote.meta.regularMarketPrice || null;
    } catch (error) {
      console.error(`Erro ao buscar preço para ${symbol}:`, error);
      throw error;
    }
  };

  // Função para atualizar todos os preços
  const updateAllPrices = async () => {
    setUpdating(true);
    setError(null);
    
    // Cria uma cópia profunda para evitar referências
    const updatedPrices = JSON.parse(JSON.stringify(assetPrices));
    let totalOriginalValue = 0;
    let totalCurrentValue = 0;
    
    for (let i = 0; i < investments.length; i++) {
      const investment = investments[i];
      const priceIndex = updatedPrices.findIndex(p => p.asset === investment.asset);
      
      if (priceIndex === -1) continue;
      
      try {
        if (investment.yahooSymbol) {
          const currentPrice = await fetchCurrentPrice(investment.yahooSymbol);
          
          if (currentPrice) {
            const originalPrice = investment.unitPrice;
            const currentTotal = investment.quantity * currentPrice;
            const percentChange = ((currentPrice - originalPrice) / originalPrice) * 100;
            
            updatedPrices[priceIndex] = {
              ...updatedPrices[priceIndex],
              currentPrice,
              currentTotal,
              percentChange
            };
            
            totalOriginalValue += investment.quantity * originalPrice;
            totalCurrentValue += currentTotal;
          } else {
            // Se não conseguir obter o preço atual, usar o preço original
            updatedPrices[priceIndex] = {
              ...updatedPrices[priceIndex],
              currentPrice: investment.unitPrice,
              currentTotal: investment.quantity * investment.unitPrice,
              percentChange: 0
            };
            
            totalOriginalValue += investment.quantity * investment.unitPrice;
            totalCurrentValue += investment.quantity * investment.unitPrice;
          }
        } else {
          // Tentar detectar símbolo automaticamente para novos ativos
          const detectedSymbol = getYahooSymbol(investment.asset, investment.description);
          
          if (detectedSymbol) {
            // Atualizar o investimento com o símbolo detectado
            const updatedInvestment = {...investment, yahooSymbol: detectedSymbol};
            
            // Atualizar o investimento na lista
            setInvestments(prev => 
              prev.map(inv => inv._id === investment._id ? updatedInvestment : inv)
            );
            
            // Buscar preço com o símbolo detectado
            const currentPrice = await fetchCurrentPrice(detectedSymbol);
            
            if (currentPrice) {
              const originalPrice = investment.unitPrice;
              const currentTotal = investment.quantity * currentPrice;
              const percentChange = ((currentPrice - originalPrice) / originalPrice) * 100;
              
              updatedPrices[priceIndex] = {
                ...updatedPrices[priceIndex],
                currentPrice,
                currentTotal,
                percentChange
              };
              
              totalOriginalValue += investment.quantity * originalPrice;
              totalCurrentValue += currentTotal;
            } else {
              // Se não conseguir obter o preço atual, usar o preço original
              updatedPrices[priceIndex] = {
                ...updatedPrices[priceIndex],
                currentPrice: investment.unitPrice,
                currentTotal: investment.quantity * investment.unitPrice,
                percentChange: 0
              };
              
              totalOriginalValue += investment.quantity * investment.unitPrice;
              totalCurrentValue += investment.quantity * investment.unitPrice;
            }
          } else {
            // Para ativos sem símbolo Yahoo, usar o preço original como preço atual
            updatedPrices[priceIndex] = {
              ...updatedPrices[priceIndex],
              currentPrice: investment.unitPrice,
              currentTotal: investment.quantity * investment.unitPrice,
              percentChange: 0
            };
            
            totalOriginalValue += investment.quantity * investment.unitPrice;
            totalCurrentValue += investment.quantity * investment.unitPrice;
          }
        }
        
        // Adicionar delay entre requisições para evitar bloqueio
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        updatedPrices[priceIndex] = {
          ...updatedPrices[priceIndex],
          error: `Falha ao atualizar preço: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
        };
        
        // Em caso de erro, adicionar os valores originais
        totalOriginalValue += investment.quantity * investment.unitPrice;
        totalCurrentValue += investment.quantity * investment.unitPrice;
      }
    }
    
    // Atualizar valores totais e percentagem de lucro/prejuízo
    setTotalInvestment(totalOriginalValue);
    setTotalProfitLoss(totalCurrentValue - totalOriginalValue);
    setTotalProfitLossPercentage(totalOriginalValue > 0 ? ((totalCurrentValue - totalOriginalValue) / totalOriginalValue) * 100 : 0);
    
    setAssetPrices(updatedPrices);
    setLastUpdate(new Date());
    setUpdating(false);
  };

  // Calcular totais
  const calculateTotals = () => {
    const totals = {
      originalTotal: {
        EUR: 0,
        USD: 0,
        BRL: 0
      },
      currentTotal: {
        EUR: 0,
        USD: 0,
        BRL: 0
      }
    };
    
    assetPrices.forEach(asset => {
      const currency = asset.currency as keyof typeof totals.originalTotal;
      
      if (totals.originalTotal[currency] !== undefined) {
        totals.originalTotal[currency] += asset.originalTotal;
        
        if (asset.currentTotal !== null) {
          totals.currentTotal[currency] += asset.currentTotal;
        } else {
          totals.currentTotal[currency] += asset.originalTotal;
        }
      }
    });
    
    return totals;
  };

  const totals = calculateTotals();

  const cardStyle = {
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
    border: `1px solid ${isDark ? '#555' : '#ddd'}`,
    margin: '20px 0',
    color: isDark ? 'white' : 'black'
  };

  // Estilos para a tabela do acordeão
  const tableHeaderStyle = {
    textAlign: 'left' as 'left',
    padding: '10px',
    borderBottom: `2px solid ${isDark ? '#444' : '#dee2e6'}`,
    color: isDark ? '#ddd' : '#495057'
  };

  const tableCellStyle = {
    padding: '10px',
    borderBottom: `1px solid ${isDark ? '#444' : '#dee2e6'}`,
    color: isDark ? '#ddd' : '#212529'
  };

  // Agrupar ativos por moeda para o acordeão
  const groupedAssets = assetPrices.reduce<Record<string, AssetPrice[]>>((acc, asset) => {
    if (!acc[asset.currency]) {
      acc[asset.currency] = [];
    }
    acc[asset.currency].push(asset);
    return acc;
  }, {});

  // Ordenar ativos por valor total (ordem decrescente)
  const sortAssets = (assets: AssetPrice[]) => {
    return [...assets].sort((a, b) => {
      const aTotal = a.currentTotal !== null ? a.currentTotal : a.originalTotal;
      const bTotal = b.currentTotal !== null ? b.currentTotal : b.originalTotal;
      return bTotal - aTotal;
    });
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Atualização de Preços dos Ativos</h3>
        
        <div>
          <button 
            onClick={updateAllPrices} 
            style={{
              padding: '8px 16px',
              backgroundColor: isDark ? '#3d3d3d' : '#e9ecef',
              color: isDark ? 'white' : 'black',
              border: `1px solid ${isDark ? '#555' : '#ced4da'}`,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            disabled={updating || loading}
          >
            {updating ? 'Atualizando...' : 'Atualizar Preços'}
          </button>
          
          {lastUpdate && (
            <small style={{ marginLeft: '10px', color: isDark ? '#aaa' : '#6c757d' }}>
              Última atualização: {lastUpdate.toLocaleTimeString()}
            </small>
          )}
        </div>
      </div>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: isDark ? '#472b2b' : '#f8d7da', 
          color: isDark ? '#f8d7da' : '#721c24',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      {/* Cards Informativos no Topo */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '15px', 
        marginBottom: '20px' 
      }}>
        {/* Card 1: Aportes Mensais */}
        <div style={{ 
          padding: '15px', 
          borderRadius: '8px', 
          backgroundColor: isDark ? '#3d3d3d' : '#e3f2fd',
          border: `1px solid ${isDark ? '#444' : '#b3e5fc'}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: isDark ? '#aaa' : '#0277bd' }}>Aporte Mensal Médio</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: '10px 0', 
            color: isDark ? 'white' : '#0277bd' 
          }}>
            €{monthlyInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: isDark ? '#888' : '#555' }}>
            Valor médio investido mensalmente
          </div>
        </div>
        
        {/* Card 2: Valor Total Investido */}
        <div style={{ 
          padding: '15px', 
          borderRadius: '8px', 
          backgroundColor: isDark ? '#3d3d3d' : '#e8f5e9',
          border: `1px solid ${isDark ? '#444' : '#c8e6c9'}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: isDark ? '#aaa' : '#2e7d32' }}>Valor Total Investido</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: '10px 0', 
            color: isDark ? 'white' : '#2e7d32' 
          }}>
            €{totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: isDark ? '#888' : '#555' }}>
            Valor total aportado em investimentos
          </div>
        </div>
        
        {/* Card 3: Lucro/Prejuízo */}
        <div style={{ 
          padding: '15px', 
          borderRadius: '8px', 
          backgroundColor: isDark ? '#3d3d3d' : totalProfitLoss >= 0 ? '#e3f2fd' : '#ffebee',
          border: `1px solid ${isDark ? '#444' : totalProfitLoss >= 0 ? '#b3e5fc' : '#ffcdd2'}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: isDark ? '#aaa' : totalProfitLoss >= 0 ? '#0277bd' : '#c62828' 
          }}>
            Lucro/Prejuízo
          </div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: '10px 0', 
            color: totalProfitLoss >= 0 ? (isDark ? '#81c784' : '#2e7d32') : (isDark ? '#ef9a9a' : '#c62828')
          }}>
            {totalProfitLoss >= 0 ? '+' : ''}
            {totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            <span style={{ 
              fontSize: '16px', 
              marginLeft: '5px',
              color: totalProfitLoss >= 0 ? (isDark ? '#81c784' : '#2e7d32') : (isDark ? '#ef9a9a' : '#c62828')
            }}>
              ({totalProfitLossPercentage >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%)
            </span>
          </div>
          <div style={{ fontSize: '12px', color: isDark ? '#888' : '#555' }}>
            Desempenho da carteira
          </div>
        </div>
      </div>
      
      {/* Resumo dos totais em um acordeão */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => togglePanel('totals')}
          style={{
            width: '100%',
            padding: '12px 15px',
            backgroundColor: isDark ? '#333' : '#e9ecef',
            color: isDark ? '#fff' : '#333',
            border: `1px solid ${isDark ? '#444' : '#ddd'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: openPanel === 'totals' ? '10px' : '0'
          }}
        >
          <span>Resumo por Moeda</span>
          <span>{openPanel === 'totals' ? '▲' : '▼'}</span>
        </button>
        
        {openPanel === 'totals' && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '15px', 
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: isDark ? '#333' : '#e9ecef',
            borderRadius: '0 0 8px 8px',
            border: `1px solid ${isDark ? '#444' : '#ddd'}`,
            borderTop: 'none'
          }}>
            {Object.entries(totals.originalTotal).map(([currency, value]) => {
              const currentValue = totals.currentTotal[currency as keyof typeof totals.currentTotal];
              const diff = currentValue - value;
              const percentChange = value > 0 ? (diff / value) * 100 : 0;
              
              // Só mostrar se houver algum valor
              if (value === 0) return null;
              
              return (
                <div key={currency} style={{ 
                  flex: '1', 
                  minWidth: '250px',
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? '#2d2d2d' : 'white',
                  border: `1px solid ${isDark ? '#444' : '#ddd'}`
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>{currency}</h4>
                  <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                    <span>Valor Investido: </span>
                    <strong>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</strong>
                  </div>
                  <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                    <span>Valor Atual: </span>
                    <strong>{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</strong>
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: diff >= 0 ? '#28a745' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    {diff >= 0 ? '+' : ''}{diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency} ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%)
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Painéis acordeão agrupados por moeda */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Carregando investimentos...</div>
      ) : (
        <div>
          {assetPrices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Nenhum investimento encontrado.</div>
          ) : (
            // Agrupar investimentos por moeda
            Object.entries(groupedAssets).map(([currency, currencyAssets]) => {
              const sortedAssets = sortAssets(currencyAssets);
              
              return (
                <div key={currency} style={{ marginBottom: '15px' }}>
                  <button 
                    onClick={() => togglePanel(currency)}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      backgroundColor: isDark ? '#333' : '#e9ecef',
                      color: isDark ? '#fff' : '#333',
                      border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: openPanel === currency ? '10px' : '0'
                    }}
                  >
                    <span>Investimentos em {currency} ({currencyAssets.length})</span>
                    <span>{openPanel === currency ? '▲' : '▼'}</span>
                  </button>
                  
                  {openPanel === currency && (
                    <div style={{ 
                      padding: '15px',
                      backgroundColor: isDark ? '#333' : '#f8f9fa',
                      borderRadius: '0 0 8px 8px',
                      border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                      borderTop: 'none'
                    }}>
                      <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                      }}>
                        <thead>
                          <tr>
                            <th style={tableHeaderStyle}>Ativo</th>
                            <th style={tableHeaderStyle}>Quantidade</th>
                            <th style={tableHeaderStyle}>Preço Original</th>
                            <th style={tableHeaderStyle}>Preço Atual</th>
                            <th style={tableHeaderStyle}>Variação</th>
                            <th style={tableHeaderStyle}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedAssets.map((assetPrice) => {
                            const totalValue = assetPrice.currentTotal !== null ? assetPrice.currentTotal : assetPrice.originalTotal;
                            const diff = totalValue - assetPrice.originalTotal;
                            const percentDiff = assetPrice.originalTotal > 0 ? (diff / assetPrice.originalTotal) * 100 : 0;
                            
                            return (
                              <tr key={assetPrice.asset} style={{ borderBottom: `1px solid ${isDark ? '#444' : '#dee2e6'}` }}>
                                <td style={tableCellStyle}>
                                  <div style={{ fontWeight: 'bold' }}>{assetPrice.asset}</div>
                                  <div style={{ fontSize: '12px', color: isDark ? '#aaa' : '#6c757d' }}>{assetPrice.description}</div>
                                </td>
                                <td style={tableCellStyle}>{assetPrice.quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                                <td style={tableCellStyle}>
                                  {assetPrice.originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {assetPrice.currency}
                                </td>
                                <td style={tableCellStyle}>
                                  {assetPrice.currentPrice !== null 
                                    ? `${assetPrice.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${assetPrice.currency}` 
                                    : `${assetPrice.originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${assetPrice.currency}`}
                                </td>
                                <td style={{
                                  ...tableCellStyle,
                                  color: assetPrice.percentChange !== null 
                                    ? (assetPrice.percentChange > 0 ? '#28a745' : (assetPrice.percentChange < 0 ? '#dc3545' : 'inherit'))
                                    : 'inherit'
                                }}>
                                  {assetPrice.percentChange !== null 
                                    ? `${assetPrice.percentChange > 0 ? '+' : ''}${assetPrice.percentChange.toFixed(2)}%` 
                                    : '0.00%'}
                                </td>
                                <td style={tableCellStyle}>
                                  <div>
                                    {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {assetPrice.currency}
                                  </div>
                                  <div style={{ 
                                    fontSize: '12px',
                                    color: diff >= 0 ? '#28a745' : '#dc3545',
                                    fontWeight: 'bold'
                                  }}>
                                    {diff >= 0 ? '+' : ''}{diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({percentDiff.toFixed(2)}%)
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
      
      <p style={{ fontSize: '12px', color: isDark ? '#aaa' : '#777', marginTop: '20px' }}>
        Dados fornecidos por Yahoo Finance. Os preços são apenas para referência e podem não refletir valores exatos de mercado.
        O sistema detecta automaticamente os símbolos dos seus ativos, inclusive de novos ativos adicionados à sua carteira.
      </p>
    </div>
  );
};