import { User, UserError } from './user.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
}

export interface UseUserState {
  currentUser: User | null;
  isLoading: boolean;
  error: UserError | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}
