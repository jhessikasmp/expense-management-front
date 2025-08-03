import { User } from '@shared/types/user.types';
import { ApiResponse } from './api.types';
import { api } from './api';

interface UserListResponse extends ApiResponse {
  find(arg0: (u: any) => boolean): unknown;
  data: User[];
}

interface UserCreateResponse {
  updatedAt: string | number | Date;
  createdAt: string | number | Date;
  email: string;
  name: string;
  _id: string;
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}

interface UserUpdateResponse extends ApiResponse {
  data: User;
}

interface UserDeleteResponse extends ApiResponse {
  data: { id: string; };
}

export const userService = {
  create: (user: Partial<User>) =>
    api.post<UserCreateResponse>('/users', user),

  list: () =>
    api.get<UserListResponse>('/users'),

  update: (id: string, user: Partial<User>) =>
    api.put<UserUpdateResponse>(`/users/${id}`, user),

  delete: (id: string) =>
    api.delete<UserDeleteResponse>(`/users/${id}`),

  login: (name: string, password: string) =>
    api.post<UserCreateResponse>('/users/login', { name, password })
};
