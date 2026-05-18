import type { IAdmins } from './admins.types';

export type GetAdminsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: 'a_z' | 'z_a' | 'newest' | 'oldest';
};

export type GetAdminsResponse = {
  admins: IAdmins[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};
