// Utilitário para conversão de moedas no frontend

// Taxas de conversão atualizadas para 2025
// Base: EUR
export const exchangeRates = {
  'EUR': 1,           // Euro (moeda base)
  'USD': 0.926,       // Dólar Americano
  'BRL': 0.165,       // Real Brasileiro
  'GBP': 1.176        // Libra Esterlina
};

/**
 * Converte um valor de uma moeda para outra
 * @param amount - O valor a ser convertido
 * @param fromCurrency - A moeda de origem (padrão: EUR)
 * @param toCurrency - A moeda de destino (padrão: EUR)
 * @returns O valor convertido para a moeda de destino
 */
export const convertCurrency = (amount: number, fromCurrency: string = 'EUR', toCurrency: string = 'EUR'): number => {
  // Se as moedas forem iguais, retorna o valor original
  if (fromCurrency === toCurrency) return amount;
  
  // Obter as taxas de conversão
  const fromRate = exchangeRates[fromCurrency as keyof typeof exchangeRates] || 1;
  const toRate = exchangeRates[toCurrency as keyof typeof exchangeRates] || 1;
  
  // Converter para EUR primeiro (como moeda intermediária) e depois para a moeda de destino
  const valueInEUR = amount * fromRate;
  const valueInTargetCurrency = valueInEUR / toRate;
  
  // Arredondar para 2 casas decimais
  return Number(valueInTargetCurrency.toFixed(2));
};

/**
 * Converte um valor para EUR
 * @param amount - O valor a ser convertido
 * @param fromCurrency - A moeda de origem (padrão: EUR)
 * @returns O valor convertido para EUR
 */
export const convertToEUR = (amount: number, fromCurrency: string = 'EUR'): number => {
  return convertCurrency(amount, fromCurrency, 'EUR');
};

/**
 * Retorna o símbolo da moeda
 * @param currency - O código da moeda
 * @returns O símbolo da moeda
 */
export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    'EUR': '€',
    'USD': '$',
    'BRL': 'R$',
    'GBP': '£'
  };
  
  return symbols[currency] || currency;
};
