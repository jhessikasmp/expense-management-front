import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { investmentService } from '../services/api';

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

  // Carregar investimentos quando o componente montar
  useEffect(() => {
    const fetchInvestments = async () => {
      setLoading(true);
      try {
        const response = await investmentService.list();
        const investments = response.data;
        
        // Adicionar símbolos do Yahoo Finance aos investimentos
        const enhancedInvestments = investments.map((inv: any) => ({
          ...inv,
          yahooSymbol: getYahooSymbol(inv.asset, inv.description)
        }));
        
        setInvestments(enhancedInvestments);
        
        // Inicializar os preços dos ativos com os valores originais
        const initialPrices = enhancedInvestments.map((inv: any) => ({
          asset: inv.asset,
          description: inv.description,
          quantity: inv.quantity,
          originalPrice: inv.unitPrice,
          currentPrice: null,
          originalTotal: inv.quantity * inv.unitPrice,
          currentTotal: null,
          currency: inv.currency,
          percentChange: null
        }));
        
        setAssetPrices(initialPrices);
      } catch (err) {
        console.error('Erro ao carregar investimentos:', err);
        setError('Falha ao carregar investimentos. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvestments();
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
    
    const updatedPrices = [...assetPrices];
    
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
            }
          } else {
            // Para ativos sem símbolo Yahoo, mantemos os dados originais
            updatedPrices[priceIndex] = {
              ...updatedPrices[priceIndex],
              currentPrice: investment.unitPrice,
              currentTotal: investment.quantity * investment.unitPrice,
              percentChange: 0
            };
          }
        }
        
        // Adicionar delay entre requisições para evitar bloqueio
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        updatedPrices[priceIndex] = {
          ...updatedPrices[priceIndex],
          error: `Falha ao atualizar preço: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
        };
      }
    }
    
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

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as 'collapse',
    marginTop: '15px'
  };

  const cellStyle = {
    padding: '12px',
    borderBottom: `1px solid ${isDark ? '#555' : '#eee'}`,
    textAlign: 'left' as 'left'
  };

  const headerCellStyle = {
    ...cellStyle,
    fontWeight: 'bold' as 'bold',
    color: isDark ? '#ccc' : '#333',
    backgroundColor: isDark ? '#3d3d3d' : '#f0f0f0'
  };

  // Agrupar ativos por moeda
  const eurAssets = assetPrices.filter(asset => asset.currency === 'EUR');
  const usdAssets = assetPrices.filter(asset => asset.currency === 'USD');
  const brlAssets = assetPrices.filter(asset => asset.currency === 'BRL');

  // Ordenar ativos por valor total (ordem decrescente)
  const sortAssets = (assets: AssetPrice[]) => {
    return [...assets].sort((a, b) => {
      const aTotal = a.currentTotal !== null ? a.currentTotal : a.originalTotal;
      const bTotal = b.currentTotal !== null ? b.currentTotal : b.originalTotal;
      return bTotal - aTotal;
    });
  };

  const sortedEurAssets = sortAssets(eurAssets);
  const sortedUsdAssets = sortAssets(usdAssets);
  const sortedBrlAssets = sortAssets(brlAssets);

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
      
      {/* Resumo dos totais */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '15px', 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: isDark ? '#333' : '#e9ecef',
        borderRadius: '8px'
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
      
      {/* Ativos em EUR */}
      {sortedEurAssets.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h4>Ativos em EUR</h4>
          {loading ? (
            <p>Carregando ativos...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>Ativo</th>
                    <th style={headerCellStyle}>Descrição</th>
                    <th style={headerCellStyle}>Quantidade</th>
                    <th style={headerCellStyle}>Preço Compra</th>
                    <th style={headerCellStyle}>Preço Atual</th>
                    <th style={headerCellStyle}>Total Investido</th>
                    <th style={headerCellStyle}>Total Atual</th>
                    <th style={headerCellStyle}>Variação</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEurAssets.map(asset => (
                    <tr key={asset.asset}>
                      <td style={cellStyle}><strong>{asset.asset}</strong></td>
                      <td style={cellStyle}>{asset.description}</td>
                      <td style={cellStyle}>{asset.quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                      <td style={cellStyle}>{asset.currency} {asset.originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={cellStyle}>
                        {asset.currentPrice !== null 
                          ? `${asset.currency} ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : <span style={{ color: isDark ? '#dc3545' : '#dc3545' }}>Indisponível</span>}
                      </td>
                      <td style={cellStyle}>{asset.currency} {asset.originalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={cellStyle}>
                        {asset.currentTotal !== null 
                          ? `${asset.currency} ${asset.currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : <span style={{ color: isDark ? '#dc3545' : '#dc3545' }}>Indisponível</span>}
                      </td>
                      <td style={{
                        ...cellStyle,
                        color: asset.percentChange !== null 
                          ? (asset.percentChange > 0 
                            ? '#28a745' 
                            : (asset.percentChange < 0 ? '#dc3545' : 'inherit'))
                          : 'inherit'
                      }}>
                        {asset.percentChange !== null 
                          ? `${asset.percentChange > 0 ? '+' : ''}${asset.percentChange.toFixed(2)}%` 
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Ativos em USD */}
      {sortedUsdAssets.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h4>Ativos em USD</h4>
          {loading ? (
            <p>Carregando ativos...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>Ativo</th>
                    <th style={headerCellStyle}>Descrição</th>
                    <th style={headerCellStyle}>Quantidade</th>
                    <th style={headerCellStyle}>Preço Compra</th>
                    <th style={headerCellStyle}>Preço Atual</th>
                    <th style={headerCellStyle}>Total Investido</th>
                    <th style={headerCellStyle}>Total Atual</th>
                    <th style={headerCellStyle}>Variação</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsdAssets.map(asset => (
                    <tr key={asset.asset}>
                      <td style={cellStyle}><strong>{asset.asset}</strong></td>
                      <td style={cellStyle}>{asset.description}</td>
                      <td style={cellStyle}>{asset.quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                      <td style={cellStyle}>{asset.currency} {asset.originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={cellStyle}>
                        {asset.currentPrice !== null 
                          ? `${asset.currency} ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : <span style={{ color: isDark ? '#dc3545' : '#dc3545' }}>Indisponível</span>}
                      </td>
                      <td style={cellStyle}>{asset.currency} {asset.originalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={cellStyle}>
                        {asset.currentTotal !== null 
                          ? `${asset.currency} ${asset.currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : <span style={{ color: isDark ? '#dc3545' : '#dc3545' }}>Indisponível</span>}
                      </td>
                      <td style={{
                        ...cellStyle,
                        color: asset.percentChange !== null 
                          ? (asset.percentChange > 0 
                            ? '#28a745' 
                            : (asset.percentChange < 0 ? '#dc3545' : 'inherit'))
                          : 'inherit'
                      }}>
                        {asset.percentChange !== null 
                          ? `${asset.percentChange > 0 ? '+' : ''}${asset.percentChange.toFixed(2)}%` 
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Ativos em BRL */}
      {sortedBrlAssets.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h4>Ativos em BRL</h4>
          {loading ? (
            <p>Carregando ativos...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>Ativo</th>
                    <th style={headerCellStyle}>Descrição</th>
                    <th style={headerCellStyle}>Quantidade</th>
                    <th style={headerCellStyle}>Preço Compra</th>
                    <th style={headerCellStyle}>Preço Atual</th>
                    <th style={headerCellStyle}>Total Investido</th>
                    <th style={headerCellStyle}>Total Atual</th>
                    <th style={headerCellStyle}>Variação</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBrlAssets.map(asset => (
                    <tr key={asset.asset}>
                      <td style={cellStyle}><strong>{asset.asset}</strong></td>
                      <td style={cellStyle}>{asset.description}</td>
                      <td style={cellStyle}>{asset.quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                      <td style={cellStyle}>{asset.currency} {asset.originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={cellStyle}>
                        {asset.currentPrice !== null 
                          ? `${asset.currency} ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : <span style={{ color: isDark ? '#dc3545' : '#dc3545' }}>Indisponível</span>}
                      </td>
                      <td style={cellStyle}>{asset.currency} {asset.originalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={cellStyle}>
                        {asset.currentTotal !== null 
                          ? `${asset.currency} ${asset.currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : <span style={{ color: isDark ? '#dc3545' : '#dc3545' }}>Indisponível</span>}
                      </td>
                      <td style={{
                        ...cellStyle,
                        color: asset.percentChange !== null 
                          ? (asset.percentChange > 0 
                            ? '#28a745' 
                            : (asset.percentChange < 0 ? '#dc3545' : 'inherit'))
                          : 'inherit'
                      }}>
                        {asset.percentChange !== null 
                          ? `${asset.percentChange > 0 ? '+' : ''}${asset.percentChange.toFixed(2)}%` 
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
