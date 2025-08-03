import { User as ApiUser } from '../shared/types/user.types';

export interface User extends Omit<ApiUser, 'createdAt' | 'updatedAt'> {
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreatePayload = Pick<User, 'name' | 'email'> & {
  currency: string;
};
