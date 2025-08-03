import { useState, useEffect, useCallback } from 'react';
import { User } from '@shared/types/user.types';
import { parseStoredUser } from '@shared/utils/typeGuards';

interface UseUserState {
  currentUser: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useUserState = (): UseUserState => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      const parsedUser = parseStoredUser(savedUser);
      if (parsedUser && !parsedUser.createdAt) {
        // Ensure createdAt is always a Date
        parsedUser.createdAt = new Date();
      }
      setCurrentUser(parsedUser as User | null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load user'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((user: User) => {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save user'));
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove user'));
    }
  }, []);

  return { currentUser, isLoading, error, login, logout };
};
