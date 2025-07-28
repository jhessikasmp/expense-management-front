// Exemplo de como consultar preços na Yahoo Finance API
// Salvei como arquivo separado para você poder usar como referência

// Lista de ativos ETFs da sua carteira
const etfs = [
  { symbol: 'CHIP.PA', description: 'SBF - ETF de Semicondutores' },
  { symbol: 'GLUX.PA', description: 'SBF - Amundi S&P Global Luxury UCITS ETF' },
  { symbol: 'HLQD.L', description: 'LSEETF - iShares USD Corporate Bond Interest Rate Hedged UCITS ETF' },
  { symbol: 'INFR.L', description: 'LSEETF - ETF de Infraestrutura' },
  { symbol: 'SGLD.L', description: 'LSEETF - Invesco Physical Gold A' },
  { symbol: 'VWCE.DE', description: 'IBIS2 - Vanguard FTSE All-World UCITS ETF' },
  { symbol: 'XAIX.DE', description: 'IBIS2 - iShares Core S&P 500 UCITS ETF' }
];

// Função para buscar preço atual de um ETF
async function getETFPrice(symbol) {
  try {
    // Montar a URL da Yahoo Finance API
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;
    
    // Fazer a requisição
    const response = await fetch(url);
    const data = await response.json();
    
    // Extrair o preço atual
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
      price,
      currency,
      change: change.toFixed(2)
    };
  } catch (error) {
    console.error(`Erro ao buscar preço para ${symbol}:`, error);
    return { symbol, price: null, currency: null, change: null, error: error.message };
  }
}

// Função para buscar preços de criptomoedas no CoinGecko
async function getCryptoPrice(coinId) {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,eur&include_24h_change=true`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data[coinId]) {
      throw new Error(`Dados não encontrados para ${coinId}`);
    }
    
    return {
      id: coinId,
      price_usd: data[coinId].usd,
      price_eur: data[coinId].eur,
      change_24h: data[coinId].usd_24h_change?.toFixed(2) || null
    };
  } catch (error) {
    console.error(`Erro ao buscar preço para ${coinId}:`, error);
    return { id: coinId, price_usd: null, price_eur: null, change_24h: null, error: error.message };
  }
}

// Exemplo de uso - ETFs
async function getETFPrices() {
  const results = [];
  
  // Buscar preços em série para evitar muitas requisições simultâneas
  for (const etf of etfs) {
    console.log(`Buscando preço para ${etf.symbol}...`);
    const priceData = await getETFPrice(etf.symbol);
    results.push({
      ...etf,
      price: priceData.price,
      currency: priceData.currency,
      change: priceData.change,
      error: priceData.error
    });
    
    // Adicionar um pequeno delay entre as requisições
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.table(results);
  return results;
}

// Exemplo de uso - Criptomoedas
async function getCryptoPrices() {
  const cryptos = [
    { id: 'bitcoin', symbol: 'BTC' },
    { id: 'ethereum', symbol: 'ETH' },
    { id: 'binancecoin', symbol: 'BNB' },
    { id: 'solana', symbol: 'SOL' },
    { id: 'near', symbol: 'NEAR' }
  ];
  
  const results = [];
  
  for (const crypto of cryptos) {
    console.log(`Buscando preço para ${crypto.symbol}...`);
    const priceData = await getCryptoPrice(crypto.id);
    results.push({
      ...crypto,
      price_usd: priceData.price_usd,
      price_eur: priceData.price_eur,
      change_24h: priceData.change_24h,
      error: priceData.error
    });
    
    // Adicionar um pequeno delay entre as requisições
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.table(results);
  return results;
}

// Você pode chamar essas funções assim:
// getETFPrices().then(results => console.log(results));
// getCryptoPrices().then(results => console.log(results));
