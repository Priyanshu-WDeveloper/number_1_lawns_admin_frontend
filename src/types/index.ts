// Auth types
export interface User {
  email: string;
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: 'Active' | 'Inactive';
  balance: number;
}

// Employee types
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'Active' | 'Inactive';
}

// Job types
export interface Job {
  id: string;
  title: string;
  customer: string;
  employee: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  date: string;
}

// Invoice types
export interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
}

// Admin User types (for Super Admin)
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

// Billing types (for Super Admin)
export interface BillingStat {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface InvoiceData {
  id: string;
  customer: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
}