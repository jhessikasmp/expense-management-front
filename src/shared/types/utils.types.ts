export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  decimals?: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  direction: SortDirection;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface FilterOptions {
  [key: string]: string | number | boolean | Date | null;
}

export type ErrorHandler = (error: Error) => void;

export interface ValidationError {
  field: string;
  message: string;
}
