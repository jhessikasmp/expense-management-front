import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

interface AssetPrice {
  symbol: string;
  name: string;
  currentPrice: number | null;
  currency: string;
  priceChange: number | null;
  lastUpdated: Date;
  error?: string;
}

interface PortfolioAsset {
  asset: string;
  yahooSymbol?: string;
  coinGeckoId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  type: 'etf' | 'crypto' | 'stock' | 'fund' | 'other';
}

export const PortfolioTracker: React.FC = () => {
  const [assetPrices, setAssetPrices] = useState<AssetPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { isDark } = useTheme();

  // Lista de ativos do seu portfólio com mapeamento para as APIs
  const portfolioAssets: PortfolioAsset[] = [
    // ETFs europeus
    { 
      asset: 'CHIP', 
      yahooSymbol: 'CHIP.PA',
      description: 'SBF - ETF de Semicondutores', 
      quantity: 407, 
      unitPrice: 56.98, 
      currency: 'EUR',
      type: 'etf'
    },
    { 
      asset: 'GLUX', 
      yahooSymbol: 'GLUX.PA',
      description: 'SBF - Amundi S&P Global Luxury UCITS ETF', 
      quantity: -3.06, 
      unitPrice: 207.06, 
      currency: 'EUR',
      type: 'etf'
    },
    { 
      asset: 'HLQD', 
      yahooSymbol: 'HLQD.L',
      description: 'LSEETF - iShares USD Corporate Bond Interest Rate Hedged UCITS ETF', 
      quantity: 22.69, 
      unitPrice: 6.977, 
      currency: 'EUR',
      type: 'etf'
    },
    { 
      asset: 'INFR', 
      yahooSymbol: 'INFR.L',
      description: 'LSEETF - ETF de Infraestrutura', 
      quantity: 0.35, 
      unitPrice: 2597.5, 
      currency: 'EUR',
      type: 'etf'
    },
    { 
      asset: 'SGLD', 
      yahooSymbol: 'SGLD.L',
      description: 'LSEETF - Invesco Physical Gold A (ETF de ouro físico)', 
      quantity: 2, 
      unitPrice: 320.74, 
      currency: 'EUR',
      type: 'etf'
    },
    { 
      asset: 'VWCE', 
      yahooSymbol: 'VWCE.DE',
      description: 'IBIS2 - Vanguard FTSE All-World UCITS ETF', 
      quantity: 428, 
      unitPrice: 133.74, 
      currency: 'EUR',
      type: 'etf'
    },
    { 
      asset: 'XAIX', 
      yahooSymbol: 'XAIX.DE',
      description: 'IBIS2 - iShares Core S&P 500 UCITS ETF', 
      quantity: 116, 
      unitPrice: 139.32, 
      currency: 'EUR',
      type: 'etf'
    },
    
    // Criptomoedas (usando CoinGecko IDs)
    { 
      asset: 'BTC', 
      coinGeckoId: 'bitcoin',
      description: 'Bitcoin - Criptomoeda Original', 
      quantity: 0.004937, 
      unitPrice: 118119.37, 
      currency: 'USD',
      type: 'crypto'
    },
    { 
      asset: 'WETH', 
      coinGeckoId: 'ethereum',
      description: 'Polygon - Wrapped Ethereum', 
      quantity: 0.110953, 
      unitPrice: 3773.29, 
      currency: 'USD',
      type: 'crypto'
    },
    { 
      asset: 'NEAR', 
      coinGeckoId: 'near',
      description: 'NEAR Protocol - Blockchain Platform', 
      quantity: 3.150605, 
      unitPrice: 2.9, 
      currency: 'USD',
      type: 'crypto'
    },
    { 
      asset: 'BNB', 
      coinGeckoId: 'binancecoin',
      description: 'BNB Smart Chain - Binance Coin', 
      quantity: 0.006743, 
      unitPrice: 796.34, 
      currency: 'USD',
      type: 'crypto'
    },
    { 
      asset: 'SOL', 
      coinGeckoId: 'solana',
      description: 'Solana - Blockchain Platform', 
      quantity: 0.022481, 
      unitPrice: 187.32, 
      currency: 'USD',
      type: 'crypto'
    },
  ];

  // Função para buscar preços de ETFs/ações na Yahoo Finance API
  const fetchYahooFinancePrice = async (symbol: string): Promise<AssetPrice | null> => {
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`);
      const data = await response.json();
      
      const quote = data?.chart?.result?.[0];
      if (!quote) {
        throw new Error(`Dados não encontrados para ${symbol}`);
      }
      
      const price = quote.meta.regularMarketPrice;
      const currency = quote.meta.currency;
      const previousClose = quote.meta.previousClose;
      const change = ((price - previousClose) / previousClose) * 100;
      
      return {
        symbol,
        name: symbol,
        currentPrice: price,
        currency,
        priceChange: parseFloat(change.toFixed(2)),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error(`Erro ao buscar preço na Yahoo Finance para ${symbol}:`, error);
      return {
        symbol,
        name: symbol,
        currentPrice: null,
        currency: '',
        priceChange: null,
        lastUpdated: new Date(),
        error: `Falha ao buscar preço: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

  // Usar useEffect diretamente
  useEffect(() => {
    // Função para buscar preços definida dentro do useEffect
    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const results: AssetPrice[] = [];
        
        // Buscar preços de ETFs/ações (Yahoo Finance)
        const etfAssets = portfolioAssets.filter(asset => asset.yahooSymbol);
        for (const asset of etfAssets) {
          if (asset.yahooSymbol) {
            const priceData = await fetchYahooFinancePrice(asset.yahooSymbol);
            if (priceData) {
              results.push({
                ...priceData,
                name: asset.description,
                symbol: asset.asset
              });
            }
            
            // Adicionar delay entre requisições para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        // Buscar preços de criptomoedas (CoinGecko)
        const cryptoAssets = portfolioAssets.filter(asset => asset.coinGeckoId);
        // Montar lista de IDs para buscar em uma única requisição
        const coinIds = cryptoAssets.map(asset => asset.coinGeckoId).join(',');
        
        if (coinIds) {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd,eur&include_24h_change=true&include_last_updated_at=true`
          );
          const data = await response.json();
          
          for (const asset of cryptoAssets) {
            if (asset.coinGeckoId && data[asset.coinGeckoId]) {
              const coinData = data[asset.coinGeckoId];
              results.push({
                symbol: asset.asset,
                name: asset.description,
                currentPrice: coinData.usd,
                currency: 'USD',
                priceChange: parseFloat((coinData.usd_24h_change || 0).toFixed(2)),
                lastUpdated: new Date(coinData.last_updated_at * 1000 || Date.now())
              });
            } else {
              results.push({
                symbol: asset.asset,
                name: asset.description,
                currentPrice: null,
                currency: 'USD',
                priceChange: null,
                lastUpdated: new Date(),
                error: `Dados não encontrados para ${asset.coinGeckoId}`
              });
            }
          }
        }
        
        setAssetPrices(results);
        setLastUpdate(new Date());
      } catch (err) {
        setError(`Erro ao buscar preços dos ativos: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        console.error('Erro ao buscar preços:', err);
      } finally {
        setLoading(false);
      }
    };

    // Chamar função imediatamente
    fetchPrices();
    
    // Configurar intervalo para atualização periódica
    const intervalId = setInterval(fetchPrices, 5 * 60 * 1000);
    
    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
    // portfolioAssets é uma constante definida no escopo do componente e não muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Agrupar ativos por tipo
  const etfs = assetPrices.filter(asset => 
    portfolioAssets.find(pa => pa.asset === asset.symbol)?.type === 'etf'
  );
  
  const cryptos = assetPrices.filter(asset => 
    portfolioAssets.find(pa => pa.asset === asset.symbol)?.type === 'crypto'
  );

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Preços de Mercado</h3>
        
        <div>
          <button 
            onClick={() => {
              // Definimos a função de buscar preços dentro do useEffect, 
              // então precisamos forçar o componente a renderizar novamente
              setLoading(true);
              setTimeout(() => {
                // O useEffect será chamado novamente, forçando uma atualização
                setAssetPrices([]);
              }, 100);
            }} 
            style={{
              padding: '8px 16px',
              backgroundColor: isDark ? '#3d3d3d' : '#e9ecef',
              color: isDark ? 'white' : 'black',
              border: `1px solid ${isDark ? '#555' : '#ced4da'}`,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Atualizando...' : 'Atualizar Preços'}
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
      
      <div style={{ marginBottom: '30px' }}>
        <h4>ETFs & Ações</h4>
        {loading && etfs.length === 0 ? (
          <p>Carregando preços de ETFs...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Ativo</th>
                  <th style={headerCellStyle}>Descrição</th>
                  <th style={headerCellStyle}>Preço Atual</th>
                  <th style={headerCellStyle}>Variação 24h</th>
                </tr>
              </thead>
              <tbody>
                {etfs.map(asset => (
                  <tr key={asset.symbol}>
                    <td style={cellStyle}><strong>{asset.symbol}</strong></td>
                    <td style={cellStyle}>{asset.name}</td>
                    <td style={cellStyle}>
                      {asset.currentPrice 
                        ? `${asset.currency} ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                        : <span style={{ color: isDark ? '#dc3545' : '#dc3545' }}>Indisponível</span>}
                    </td>
                    <td style={{
                      ...cellStyle,
                      color: asset.priceChange 
                        ? (asset.priceChange > 0 
                          ? '#28a745' 
                          : (asset.priceChange < 0 ? '#dc3545' : 'inherit'))
                        : 'inherit'
                    }}>
                      {asset.priceChange 
                        ? `${asset.priceChange > 0 ? '+' : ''}${asset.priceChange}%` 
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div>
        <h4>Criptomoedas</h4>
        {loading && cryptos.length === 0 ? (
          <p>Carregando preços de criptomoedas...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Ativo</th>
                  <th style={headerCellStyle}>Descrição</th>
                  <th style={headerCellStyle}>Preço Atual</th>
                  <th style={headerCellStyle}>Variação 24h</th>
                </tr>
              </thead>
              <tbody>
                {cryptos.map(asset => (
                  <tr key={asset.symbol}>
                    <td style={cellStyle}><strong>{asset.symbol}</strong></td>
                    <td style={cellStyle}>{asset.name}</td>
                    <td style={cellStyle}>
                      {asset.currentPrice 
                        ? `${asset.currency} ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                        : <span style={{ color: isDark ? '#dc3545' : '#dc3545' }}>Indisponível</span>}
                    </td>
                    <td style={{
                      ...cellStyle,
                      color: asset.priceChange 
                        ? (asset.priceChange > 0 
                          ? '#28a745' 
                          : (asset.priceChange < 0 ? '#dc3545' : 'inherit'))
                        : 'inherit'
                    }}>
                      {asset.priceChange 
                        ? `${asset.priceChange > 0 ? '+' : ''}${asset.priceChange}%` 
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <p style={{ fontSize: '12px', color: isDark ? '#aaa' : '#777', marginTop: '20px' }}>
        Dados fornecidos por Yahoo Finance (ETFs/Ações) e CoinGecko (Criptomoedas). 
        Atualizados a cada 5 minutos. Os preços são apenas para referência e podem não refletir valores exatos de mercado.
      </p>
    </div>
  );
};
