export interface User {
  _id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  currency?: string;
}

export interface UserError {
  message: string;
  code?: string;
}

export interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: UserError | null;
}
