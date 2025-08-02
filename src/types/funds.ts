export interface FundEntry {
  _id?: string;
  userId: string;
  amount: number;
  type: 'contribution' | 'expense';  // contribution para entradas, expense para saídas
  date: Date;
  fundType: 'investment' | 'travel' | 'emergency' | 'car' | 'allowance';
  description?: string;
}

export interface MonthlyContribution {
  userId: string;
  amount: number;
  fundType: 'investment' | 'travel' | 'emergency' | 'car' | 'allowance';
  dayOfMonth: number;  // Dia do mês para fazer o aporte
  isActive: boolean;   // Se a contribuição mensal está ativa
}
