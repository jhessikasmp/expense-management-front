import { User } from './user.types';
import { 
  Expense, 
  Investment, 
  TravelFund, 
  EmergencyFund as EmergencyFundType, 
  CarFund, 
  Allowance as AllowanceType,
  DashboardData 
} from './api.types';

export interface DashboardProps {
  currentUser: User;
  data?: DashboardData;
  onRefresh?: () => void;
  key?: number;
}

export interface ExpenseFormProps {
  currentUser: User;
  initialExpense?: Expense;
  onExpenseCreated: () => void;
  onExpenseUpdated?: () => void;
}

export interface ExpenseHistoryProps {
  currentUser: User;
  expenses?: Expense[];
  onExpenseUpdated: () => void;
  onDelete?: (id: string) => Promise<void>;
}

export interface InvestmentContainerProps {
  currentUser: User;
  investments?: Investment[];
  onInvestmentCreated: () => void;
  onInvestmentUpdated?: () => void;
  onDelete?: (id: string) => Promise<void>;
  key?: number;
}

export interface TravelFundFormProps {
  currentUser: User;
  fund?: TravelFund;
  onTravelFundCreated: () => void;
  onTravelFundUpdated?: () => void;
  key?: number;
}

export interface EmergencyFundProps {
  currentUser: User;
  fund?: EmergencyFundType;
  onEmergencyFundUpdated?: () => void;
  key?: number;
}

export interface CarReserveProps {
  currentUser: User;
  fund?: CarFund;
  onCarFundUpdated?: () => void;
  key?: number;
}

export interface AllowanceProps {
  currentUser: User;
  allowance?: AllowanceType;
  onAllowanceUpdated?: () => void;
  key?: number;
}

export interface AnnualChartProps {
  data?: {
    expenses: { [month: string]: number };
    investments: { [month: string]: number };
  };
  key?: number;
}

export interface LoadingProps {
  message?: string;
}

export interface ErrorProps {
  message: string;
  onRetry?: () => void;
}
