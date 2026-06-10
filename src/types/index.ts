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
  balance?: number;
  companyName: string;
  gstNumber: string;
  bankAccountNumber: string;
  invoiceLogo?: string;
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

export interface IAdminStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  totalBalance: number;
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
        customerId?: string;
        address?: string;
        countryCode?: string;
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
        countryCode?: string;
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
  receivePrice?: number;
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

export interface IParentJob {
  _id?: string;
  __v?: number;
  jobId: string;
  adminId?:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        fullName?: string;
      };
  customerId?:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        fullName?: string;
        address?: string;
      };
  jobType: string;
  frequencyValue?: number;
  frequencyUnit?: string;
  paymentType?: string;
  price?: number;
  status?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  description?: string;
  location?: {
    type: 'Point';
    coordinates?: [number, number];
  };
}

export interface IDashboardAnalytics {
  summary: {
    totalCustomers: number;
    totalEmployees: number;
    totalJobs: number;
    totalInvoices: number;
  };
  charts: {
    customers: number[];
    employees: number[];
    jobs: number[];
  };
  recentActivities: Array<{
    id: string;
    type: 'employee' | 'customer';
    message: string;
    timestamp: string;
  }>;
}

export interface IPopulatedCustomer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  fullName: string;
}

export interface ITraining {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IInvoice {
  _id?: string;
  invoiceNumber?: string;
  customer?: string;
  customerId?: string | IPopulatedCustomer;
  jobId?: string | IJob;
  amount?: number;
  receivedAmount?: number;
  balance?: number;
  paymentType?: string;
  status?: string;
  downloadUrl?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
