// App Routes
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  SUPER_ADMIN_LOGIN: '/super-admin-login',

  // Admin routes
  DASHBOARD: '/dashboard',
  CUSTOMERS: '/customers',
  CUSTOMERS_CREATE: '/customers/create',
  EMPLOYEES: '/employees',
  EMPLOYEES_CREATE: '/employees/create',
  JOBS: '/jobs',
  JOBS_CREATE: '/jobs/create',
  INVOICES: '/invoices',

  // Super Admin routes
  SUPER_ADMIN_DASHBOARD: '/super-admin/dashboard',
  SUPER_ADMIN_ADMINS: '/super-admin/admins',
  SUPER_ADMIN_BILLING: '/super-admin/billing',

  // Default redirects
  DEFAULT_REDIRECT: '/dashboard',
  SUPER_ADMIN_DEFAULT_REDIRECT: '/super-admin/dashboard',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',

  // Customers
  CUSTOMERS: '/api/customers',
  CUSTOMER_BY_ID: (id: string) => `/api/customers/${id}`,

  // Employees
  EMPLOYEES: '/api/employees',
  EMPLOYEE_BY_ID: (id: string) => `/api/employees/${id}`,

  // Jobs
  JOBS: '/api/jobs',
  JOB_BY_ID: (id: string) => `/api/jobs/${id}`,

  // Invoices
  INVOICES: '/api/invoices',
  INVOICE_BY_ID: (id: string) => `/api/invoices/${id}`,

  // Super Admin
  ADMIN_USERS: '/api/super-admin/admins',
  ADMIN_USER_BY_ID: (id: string) => `/api/super-admin/admins/${id}`,
  BILLING: '/api/super-admin/billing',
} as const;

// UI Constants
export const UI = {
  SIDEBAR_WIDTH: '19rem',
  BORDER_RADIUS: '20px',
  CARD_RADIUS: '20px',

  // Colors
  COLORS: {
    PRIMARY: '#16610E',
    PRIMARY_LIGHT: '#edf8e7',
    TEXT: '#151515',
    TEXT_SECONDARY: '#777',
    BORDER: '#ececec',
    BACKGROUND: '#F4F7EF',
    BACKGROUND_INNER: '#f8f8f5',
  },

  // Spacing
  PADDING: {
    MAIN: 'px-4 pt-5 pb-5',
    CARD: 'p-6',
  },

  // Breakpoints
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
  },
} as const;