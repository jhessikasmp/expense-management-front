import React, { useState, useEffect } from 'react';
import { assetPriceService } from '../services/api';
import { useTheme } from './ThemeProvider';

interface AssetPrice {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h?: number;
}

export const AssetPriceTracker: React.FC = () => {
  const [cryptoPrices, setCryptoPrices] = useState<AssetPrice[]>([]);
  const [stockPrices, setStockPrices] = useState<AssetPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();

  // Lista de criptomoedas para monitorar
  const cryptoAssets = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'ripple', symbol: 'XRP', name: 'XRP' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
    { id: 'solana', symbol: 'SOL', name: 'Solana' }
  ];

  // Lista de ações e ETFs para monitorar
  const stockAssets = [
    { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.' },
    { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft Corporation' },
    { id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com, Inc.' },
    { id: 'VUSA.L', symbol: 'VUSA', name: 'Vanguard S&P 500 UCITS ETF' },
    { id: 'EUNL.DE', symbol: 'EUNL', name: 'iShares Core MSCI World UCITS ETF' }
  ];

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obter IDs das criptomoedas
        const cryptoIds = cryptoAssets.map(crypto => crypto.id).join(',');
        
        // Buscar preços em Euro
        const result = await assetPriceService.getCryptoPrice(cryptoIds);
        
        // Processar os resultados
        const prices: AssetPrice[] = cryptoAssets.map(crypto => {
          const priceData = result[crypto.id];
          return {
            id: crypto.id,
            name: crypto.name,
            symbol: crypto.symbol,
            price: priceData?.eur || 0,
            change24h: 0 // A API simples não fornece essa informação
          };
        });
        
        setCryptoPrices(prices);
      } catch (err) {
        console.error('Erro ao buscar preços de criptomoedas:', err);
        setError('Não foi possível carregar os preços das criptomoedas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    const fetchStockPrices = async () => {
      try {
        // Para cada ação/ETF, buscar preços
        const prices = await Promise.all(
          stockAssets.map(async (stock) => {
            try {
              const result = await assetPriceService.getStockPrice(stock.id);
              
              // Extrair o preço atual e variação do resultado
              const quote = result?.chart?.result?.[0];
              const latestPrice = quote?.meta?.regularMarketPrice || 0;
              const previousClose = quote?.meta?.previousClose || latestPrice;
              const change24h = ((latestPrice - previousClose) / previousClose) * 100;
              
              return {
                id: stock.id,
                name: stock.name,
                symbol: stock.symbol,
                price: latestPrice,
                change24h
              };
            } catch (error) {
              console.error(`Erro ao buscar preço para ${stock.symbol}:`, error);
              return {
                id: stock.id,
                name: stock.name,
                symbol: stock.symbol,
                price: 0,
                change24h: 0
              };
            }
          })
        );
        
        setStockPrices(prices);
      } catch (err) {
        console.error('Erro ao buscar preços de ações/ETFs:', err);
        setError('Não foi possível carregar os preços das ações. Tente novamente mais tarde.');
      }
    };

    fetchCryptoPrices();
    fetchStockPrices();
    
    // Atualizar preços a cada 5 minutos
    const intervalId = setInterval(() => {
      fetchCryptoPrices();
      fetchStockPrices();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const cardStyle = {
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: isDark ? '#3d3d3d' : 'white',
    border: `1px solid ${isDark ? '#555' : '#ddd'}`,
    margin: '10px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    color: isDark ? 'white' : 'black'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as 'collapse',
    marginTop: '15px'
  };

  const cellStyle = {
    padding: '10px',
    borderBottom: `1px solid ${isDark ? '#555' : '#eee'}`,
    textAlign: 'left' as 'left'
  };

  const headerCellStyle = {
    ...cellStyle,
    fontWeight: 'bold' as 'bold',
    color: isDark ? '#ccc' : '#333'
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>Preços de Ativos Financeiros</h3>
      
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
      
      <div style={cardStyle}>
        <h4>Criptomoedas</h4>
        {loading ? (
          <p>Carregando preços...</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>Moeda</th>
                <th style={headerCellStyle}>Símbolo</th>
                <th style={headerCellStyle}>Preço (EUR)</th>
              </tr>
            </thead>
            <tbody>
              {cryptoPrices.map(crypto => (
                <tr key={crypto.id}>
                  <td style={cellStyle}>{crypto.name}</td>
                  <td style={cellStyle}>{crypto.symbol}</td>
                  <td style={cellStyle}>€{crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div style={cardStyle}>
        <h4>Ações e ETFs</h4>
        {loading ? (
          <p>Carregando preços...</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>Ativo</th>
                <th style={headerCellStyle}>Símbolo</th>
                <th style={headerCellStyle}>Preço</th>
                <th style={headerCellStyle}>Variação 24h</th>
              </tr>
            </thead>
            <tbody>
              {stockPrices.map(stock => (
                <tr key={stock.id}>
                  <td style={cellStyle}>{stock.name}</td>
                  <td style={cellStyle}>{stock.symbol}</td>
                  <td style={cellStyle}>${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{
                    ...cellStyle,
                    color: (stock.change24h ?? 0) > 0 ? '#28a745' : ((stock.change24h ?? 0) < 0 ? '#dc3545' : 'inherit')
                  }}>
                    {stock.change24h ? `${stock.change24h.toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <p style={{ fontSize: '12px', color: isDark ? '#aaa' : '#777', marginTop: '10px' }}>
        Dados fornecidos por CoinGecko e Yahoo Finance. Atualizados a cada 5 minutos.
      </p>
    </div>
  );
};
