export interface User {
  _id?: string;
  name: string;
  currency: string;
  createdAt?: Date;
}

export interface Expense {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  amount: number;
  category: string;
  currency: string;
  createdAt?: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface TravelFund {
  _id?: string;
  name: string;
  participants: { userId: string; contribution: number }[];
  total: number;
  currency: string;
  createdAt?: Date;
}