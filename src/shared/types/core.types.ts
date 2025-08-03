export interface Expense {
  _id: string;
  userId: string;
  name: string;
  description: string;
  amount: number;
  category: string;
  currency: string;
  createdAt: Date;
}

export interface Investment {
  _id?: string;
  userId: string;
  asset: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  description?: string;
  createdAt?: Date;
}

export interface MonthlyContribution {
  _id?: string;
  userId: string;
  fundId: string;
  amount: number;
  dayOfMonth: number;
  isActive: boolean;
  currency: string;
  fundType: 'emergency' | 'travel' | 'car' | 'allowance';
  createdAt: Date;
  updatedAt: Date;
}

export interface FundEntry {
  _id?: string;
  userId: string;
  amount: number;
  name?: string;
  description?: string;
  type: 'income' | 'expense';
  category: string;
  createdAt?: Date;
}

export interface MonthlyContribution {
  _id?: string;
  userId: string;
  fundId: string;
  amount: number;
  dayOfMonth: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  currency: string;
  fundType: 'emergency' | 'travel' | 'car' | 'allowance';
}

export interface TravelFund {
  _id?: string;
  userId: string;
  name: string;
  targetAmount?: number;
  currentAmount: number;
  deadline?: Date;
  description?: string;
  participants: { userId: string; contribution: number; }[];
  total?: number;
  currency: string;
  createdAt?: Date;
}

export interface MonthlySalary {
  _id?: string;
  userId: string;
  amount: number;
  month: number;
  year: number;
  currency: string;
  createdAt?: Date;
}

export interface MonthlyData {
  month: number;
  expenses: number;
  count: number;
}

export interface Salary {
  _id: string;
  userId: string;
  amount: number;
  month: number;
  year: number;
  currency: string;
  createdAt: Date;
}

export interface EmergencyFund {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount?: number;
  currentAmount: number;
  currency: string;
  createdAt?: Date;
}

export interface CarFund {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount?: number;
  currentAmount: number;
  currency: string;
  createdAt?: Date;
}

export interface Allowance {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  createdAt?: Date;
}

export interface DashboardData {
  expenses: Expense[];
  investments: Investment[];
  travelFunds: TravelFund[];
  emergencyFund?: EmergencyFund;
  carFund?: CarFund;
  allowance?: Allowance;
  monthlyContributions: MonthlyContribution[];
  totalExpenses?: number;
  totalInvestments?: number;
  totalFunds?: number;
}
