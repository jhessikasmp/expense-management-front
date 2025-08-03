import { User } from '../../types';

export const isUser = (value: unknown): value is User => {
  if (!value || typeof value !== 'object') return false;
  
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate._id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string'
  );
};

export const parseStoredUser = (storedUser: string | null): User | null => {
  if (!storedUser) return null;
  
  try {
    const parsed = JSON.parse(storedUser);
    return isUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
