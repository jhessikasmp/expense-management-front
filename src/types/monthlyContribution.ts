export interface MonthlyContribution {
  _id?: string;
  userId: string;
  fundId: string;
  amount: number;
  dayOfMonth: number;
  isActive: boolean;
  currency: string;
  createdAt?: Date;
}
