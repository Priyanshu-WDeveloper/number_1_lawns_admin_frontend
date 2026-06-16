// App Routes
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  SUPER_ADMIN_LOGIN: '/super-admin-login',
  FORGOT_PASSWORD: '/forgot-password',

  // Admin routes
  DASHBOARD: '/dashboard',
  SUBSCRIPTION_EXPIRED: '/subscription-expired',
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/change-password',
  CUSTOMERS: '/customers',
  CUSTOMERS_CREATE: '/customers/create',
  CUSTOMERS_VIEW: '/customers/:id',
  CUSTOMERS_EDIT: '/customers/edit/:id',
  EMPLOYEES: '/employees',
  EMPLOYEES_CREATE: '/employees/create',
  EMPLOYEES_VIEW: '/employees/:id',
  EMPLOYEES_EDIT: '/employees/edit/:id',
  JOBS: '/jobs',
  JOBS_CREATE: '/jobs/create',
  JOBS_VIEW: '/jobs/:id',
  JOBS_EDIT: '/jobs/edit/:id',
  JOBS_VIEW_MANAGE: '/jobs/manage-view/:id',
  MANAGE_JOBS: '/manage-jobs',
  SCHEDULED_JOBS: '/scheduled-jobs',
  INVOICES: '/invoices',
  INVOICES_VIEW: '/invoices/:jobId',
  INVOICES_RECEIPT: '/invoices/:jobId/receipt',
  NOTIFICATIONS: '/notifications',
  TRAINING_CENTER: '/training-center',
  TRAINING_CENTER_VIEW: '/training-center/:id',
  EXPENSES: '/expenses',
  EXPENSES_VIEW: '/expenses/:id',
  EXPENSES_EDIT: '/expenses/edit/:id',

  // Default redirects
  DEFAULT_REDIRECT: '/dashboard',
} as const;

export const ROLES = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/admins/login',
    SUPER_LOGIN: '/superadmins/login',
    LOGOUT: '/admins/logout',
    FORGOT_PASSWORD: '/admins/forgot-password',
    VERIFY_OTP: '/admins/verify-otp',
    RESET_PASSWORD: '/admins/reset-password',
  },
  CUSTOMERS: {
    LIST: '/admins/customers',
    CREATE: '/admins/customers',
    DETAILS: (id: string) => `/admins/customers/${id}`,
    UPDATE: (id: string) => `/admins/customers/${id}`,
    DELETE: (id: string) => `/admins/customers/${id}`,
    STATUS: (id: string) => `/admins/customers/${id}/status`,
  },
  EMPLOYEES: {
    LIST: '/admins/employees',
    DETAILS: (id: string) => `/admins/employees/${id}`,
    CREATE: '/admins/employees',
    UPDATE: (id: string) => `/admins/employees/${id}`,
    DELETE: (id: string) => `/admins/employees/${id}`,
    STATUS: (id: string) => `/admins/employees/${id}/status`,
    SET_VALIDITY: (id: string) => `/admins/employees/${id}/validity`,
    REMOVE_VALIDITY: (id: string) =>
      `/admins/employees/${id}/validity`,
    RESET_PASSWORD: (id: string) => `/admins/employees/${id}/password`,
    UPLOAD: '/admins/upload',
  },
  JOBS: {
    LIST: '/jobs',
    DETAILS: (id: string) => `/jobs/${id}`,
    CREATE: '/jobs',
    UPDATE: (id: string) => `/jobs/${id}`,
    DELETE: (id: string) => `/jobs/${id}`,
    CANCEL: '/jobs/cancel',
    COMPLETE: '/jobs/complete',
    ASSIGN_EMPLOYEE: `/jobs/assign-employee`,
    RECEIPT: (id: string) => `/jobs/${id}/receipt`,
    DATE: (id: string) => `/jobs/${id}/change-date`,
  },
  PARENT_JOBS: {
    LIST: '/jobs/parents',
    CANCEL: (id: string) => `/jobs/parents/${id}/cancel`,
  },
  CHILD_JOBS: {
    LIST: '/jobs',
    BY_PARENT: (parentJobId: string) =>
      `/jobs/parents/${parentJobId}/children`,
    STATUS: (id: string) => `/jobs/${id}/status`,
  },
  INVOICES: {
    LIST: '/invoices',
    VIEW_BY_JOB: (jobId: string) => `/invoices/${jobId}/view`,
    DOWNLOAD: (jobId: string) => `/invoices/${jobId}/download`,
    RESEND: (jobId: string) => `/invoices/${jobId}/resend`,
    PAYMENT_STATUS: (jobId: string) => `/invoices/${jobId}/payment-status`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    DELETE_ALL: '/notifications',
  },
  ADMINS: {
    LIST: '/admins',
    DETAILS: (id: string) => `/admins/${id}`,
    SELF: '/admins/details',
    PROFILE: '/admins/profile',
    DASHBOARD_ANALYTICS: '/admins/dashboard-analytics',
    CHANGE_PASSWORD: '/admins/change-password',
  },
  TRAININGS: {
    LIST: '/trainings',
    CREATE: '/trainings',
    DETAILS: (id: string) => `/trainings/${id}`,
    UPDATE: (id: string) => `/trainings/${id}`,
    TOGGLE_STATUS: (id: string) => `/trainings/${id}/toggle-status`,
    DELETE: (id: string) => `/trainings/${id}`,
  },
  EXPENSES: {
    LIST: '/expenses',
    CREATE: '/expenses',
    DETAILS: (id: string) => `/expenses/${id}`,
    UPDATE: (id: string) => `/expenses/${id}`,
    DELETE: (id: string) => `/expenses/${id}`,
    STATUS: (id: string) => `/expenses/${id}/status`,
    UPLOAD: '/expenses/upload',
  },
  SUPER_ADMINS: {
    ADMINS: {
      LIST: '/superadmins/admins',
      DETAILS: (id: string) => `/superadmins/edit-admin/${id}`,
      CREATE: '/superadmins/add-admin',
      UPDATE: (id: string) => `/superadmins/edit-admin/${id}`,
      DELETE: (id: string) => `/super-admin/admins/${id}`,
      SET_VALIDITY: (id: string) => `/superadmins/validity/${id}`,
      REMOVE_VALIDITY: (id: string) => `/superadmins/validity/${id}`,
    },
    CHANGE_PASSWORD: '/superadmins/change-password',
    BILLING: {
      STATS: '/super-admin/billing/stats',
      INVOICES: '/super-admin/billing/invoices',
    },
  },
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
