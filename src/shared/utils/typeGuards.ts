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

export function parseStoredUser(storedUser: string | null): User | null {
  if (!storedUser) return null;
  
  try {
    const parsed = JSON.parse(storedUser);
    if (!isUser(parsed)) return null;
    
    return {
      ...parsed,
      createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date(),
      updatedAt: parsed.updatedAt ? new Date(parsed.updatedAt) : new Date()
    };
  } catch (e) {
    console.error('Error parsing stored user:', e);
    return null;
  }
};
