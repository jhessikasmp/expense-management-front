export interface FundContribution {
  updatedAt: any;
  id?: string;
  fundId: string;
  userId: string;
  amount: number;
  description?: string;
  createdAt?: Date;
  currency: string;
}
