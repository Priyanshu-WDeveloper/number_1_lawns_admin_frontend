export type { ICustomer } from './customers.types';
export type { IEmployee } from './employees.types';

export interface IAdminUser {
  _id: string;
  adminId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  status: string;
  profileImage: string;
  countryCode: string;
  phoneNumber: string;
  role: number;
  city: string;
  address: string;
  state: string;
  postalCode: string;
  country: string;
  location?: { type: 'Point'; coordinates: [number, number] };
  createdAt: string;
  updatedAt: string;
  validity?: string;
}

export interface IJob {
  _id?: string;
  __v?: number;
  jobId: number;
  customerId?:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        profileImage?: string;
        employeeId?: string;
      };
  employeeId?:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        profileImage?: string;
        employeeId?: string;
      };
  adminId?:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        profileImage?: string;
      };
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  jobType: string;
  status?: string;
  price?: number;
  frequency?: { value: number; unit: string };
  description?: string;
  notes?: string;
  receiptUrl?: string;
  jobDate?: string;
  date: string;
  active?: boolean;
  preferredTiming?: string;
  jobDescription?: string;
  jobStatus: string;
  paymentType?: string;
  paymentStatus?: string;
  paymentAmount?: string;
  initialDepositAmount?: number;
  totalRemainingAmount?: number;
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
  startTime?: string;
  endTime?: string;
}

export interface IInvoice {
  _id?: string;
  invoiceNumber?: string;
  customer?: string;
  jobId?: string;
  totalAmount?: number;
  receivedAmount?: number;
  balance?: number;
  date?: string;
  paymentType?: string;
  status?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
