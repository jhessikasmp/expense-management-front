export interface FundContribution {
  _id?: string;
  userId: string;
  fundId: string;
  fundType: 'travel' | 'emergency' | 'car';
  amount: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}
