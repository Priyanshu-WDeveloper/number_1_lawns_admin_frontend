import type { ICustomer, IJob, IInvoice, IEmployee } from '.';
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

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'expired';
  active?: boolean;
  sort?: 'a_z' | 'z_a' | 'newest' | 'oldest';
  [key: string]: unknown;
}

export interface CustomersResponse {
  customers: ICustomer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface CustomerMutationResponse {
  message: string;
  customer: ICustomer;
}
export interface EmployeeMutationResponse {
  message: string;
  employee: IEmployee;
}
export interface JobsResponse {
  jobs: IJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobMutationResponse {
  message: string;
  job: IJob;
}

export interface InvoicesResponse {
  message: string;
  invoices: IInvoice[];
  total: number;
  page: number;
  limit: number;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export interface EmployeesResponse {
  employees: IEmployee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  [key: string]: unknown;
}

export interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  profileImage?: string;
  documents?: Array<{ name: string; file: File | null }>;
  attachments?: Array<{ key: string; value: string }>;
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  id: string;
}

