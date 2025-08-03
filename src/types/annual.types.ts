export interface MonthlyData {
  month: number;
  expenses: number;
  count: number;
}

export interface Salary {
  _id: string;
  userId: string;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnnualResponse {
  success: boolean;
  data: MonthlyData[];
}

export interface UserSummary {
  userId: string;
  name: string;
  totalSalary: number;
  totalExpenses: number;
}
