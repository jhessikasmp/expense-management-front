export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
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
