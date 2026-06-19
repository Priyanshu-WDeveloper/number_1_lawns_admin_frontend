import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { getBaseUrl } from '@/lib/config';
import { getDeviceToken, getDeviceType } from '@/lib/device';
import { getToken, localLogout } from '@/lib/auth';
import type {
  CustomersResponse,
  CustomerMutationResponse,
  EmployeeMutationResponse,
  GetAdminsParams,
  GetAdminsResponse,
  GetCustomersParams,
  EmployeesResponse,
  JobsResponse,
  JobMutationResponse,
  InvoicesResponse,
  NotificationsResponse,
  ListQueryParams,
  UpdateEmployeePayload,
  ParentJobsResponse,
  ChildJobsResponse,
  TrainingsParams,
  TrainingsResponse,
  ExpensesResponse,
  ExpenseMutationResponse,
} from '@/types/api.types';
import type { FinancialReportResponse } from '@/types/finance.types';
import type { CreateEmployeePayload } from '@/types/employees.types';
import type {
  IWalletHistoryResponse,
  IAdminWalletHistoryResponse,
  ISettlementPayload,
  ISettlementResponse,
  WalletHistoryQueryParams,
  AdminWalletHistoryQueryParams,
} from '@/types/wallet.types';
import { setAuth, clearAuth, updateUser } from '@/store/auth-slice';
import { API_ROUTES, ROUTES } from '@/constants';
import type {
  ICustomer,
  IEmployee,
  IJob,
  IInvoice,
  IAdminUser,
  IAdminStats,
  IDashboardAnalytics,
  ITraining,
  IExpense,
  OrderItemInput,
} from '@/types';

const rawBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseUrl = getBaseUrl();

  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = getToken();

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return headers;
    },
  });
  return baseQuery(args, api, extraOptions);
};

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error?.status === 401 &&
    api.endpoint !== 'login' &&
    api.endpoint !== 'superLogin'
  ) {
    localLogout();
    window.location.href = ROUTES.LOGIN;
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'Customers',
    'Employees',
    'Jobs',
    'ParentJobs',
    'ChildJobs',
    'Invoices',
    'Admins',
    'Billing',
    'Notifications',
    'Trainings',
    'Expenses',
    'Wallet',
  ],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      query: ({ rememberMe, ...credentials }) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: 'POST',
        body: {
          ...credentials,
          deviceType: getDeviceType(),
          deviceToken: getDeviceToken(),
        },
      }),
      async onQueryStarted(
        { rememberMe },
        { queryFulfilled, dispatch },
      ) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            dispatch(
              setAuth({
                user: data.user,
                token: data.token,
                rememberMe: rememberMe ?? true,
              }),
            );
          }
        } catch {
          /* handled by caller */
        }
      },
    }),
    superLogin: builder.mutation({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      query: ({ rememberMe, ...credentials }) => ({
        url: API_ROUTES.AUTH.SUPER_LOGIN,
        method: 'POST',
        body: {
          ...credentials,
          deviceType: getDeviceType(),
          deviceToken: getDeviceToken(),
        },
      }),
      async onQueryStarted(
        { rememberMe },
        { queryFulfilled, dispatch },
      ) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            dispatch(
              setAuth({
                user: data.user,
                token: data.token,
                rememberMe: rememberMe ?? true,
              }),
            );
          }
        } catch {
          /* handled by caller */
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.AUTH.LOGOUT,
        method: 'POST',
      }),

      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Logout failed', error);
        } finally {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('user');
          dispatch(clearAuth());
          dispatch(api.util.resetApiState());
        }
      },
    }),

    subscribeNotification: builder.mutation<
      void,
      {
        token: string;
      }
    >({
      query: (body) => ({
        url: '/notifications/subscribe',
        method: 'POST',
        body,
      }),
    }),

    unsubscribeNotification: builder.mutation<
      void,
      {
        token: string;
      }
    >({
      query: (body) => ({
        url: '/notifications/unsubscribe',
        method: 'POST',
        body,
      }),
    }),

    // Customer endpoints
    getCustomers: builder.query<
      CustomersResponse,
      GetCustomersParams
    >({
      query: ({ page = 1, limit = 10, search, status, sort }) => ({
        url: API_ROUTES.CUSTOMERS.LIST,
        params: {
          page,
          limit,
          search,
          status,
          sort,
        },
      }),
      providesTags: ['Customers'],
    }),
    getCustomerById: builder.query<ICustomer, string>({
      query: (id: string) => API_ROUTES.CUSTOMERS.DETAILS(id),
      providesTags: (_result, _error, id) => [
        { type: 'Customers', id },
      ],
    }),
    createCustomer: builder.mutation<
      CustomerMutationResponse,
      Partial<ICustomer>
    >({
      query: (customer) => ({
        url: API_ROUTES.CUSTOMERS.CREATE,
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customers'],
    }),
    updateCustomer: builder.mutation<
      CustomerMutationResponse,
      { id: string } & Partial<ICustomer>
    >({
      query: ({ id, ...customer }) => ({
        url: API_ROUTES.CUSTOMERS.UPDATE(id),
        method: 'PUT',
        body: customer,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Customers',
        { type: 'Customers', id },
      ],
    }),
    deleteCustomer: builder.mutation<
      CustomerMutationResponse,
      string
    >({
      query: (id) => ({
        url: API_ROUTES.CUSTOMERS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Customers'],
    }),
    toggleCustomerStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: API_ROUTES.CUSTOMERS.STATUS(id),
        method: 'PATCH',
        body: {
          active: status === 'active',
          status: status === 'active' ? 'Active' : 'Inactive',
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Customers',
        { type: 'Customers', id },
      ],
    }),

    // Employee endpoints
    getEmployees: builder.query<EmployeesResponse, ListQueryParams>({
      query: ({ page = 1, limit = 10, search, status, sort }) => ({
        url: API_ROUTES.EMPLOYEES.LIST,
        params: { page, limit, search, status, sort },
      }),
      providesTags: ['Employees'],
    }),
    getEmployeeById: builder.query<IEmployee, string>({
      query: (id: string) => API_ROUTES.EMPLOYEES.DETAILS(id),
      providesTags: (_result, _error, id) => [
        { type: 'Employees', id },
      ],
    }),
    createEmployee: builder.mutation<
      EmployeeMutationResponse,
      CreateEmployeePayload
    >({
      query: (employee) => ({
        url: API_ROUTES.EMPLOYEES.CREATE,
        method: 'POST',
        body: employee,
      }),
      invalidatesTags: ['Employees'],
    }),
    updateEmployee: builder.mutation<
      EmployeeMutationResponse,
      UpdateEmployeePayload
    >({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.EMPLOYEES.UPDATE(id!),
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Employees',
        { type: 'Employees', id },
      ],
    }),
    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.EMPLOYEES.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Employees'],
    }),
    toggleEmployeeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: API_ROUTES.EMPLOYEES.STATUS(id),
        method: 'PATCH',
        body: {
          active: status === 'active',
          status: status === 'active' ? 'Active' : 'Inactive',
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Employees',
        { type: 'Employees', id },
      ],
    }),
    setEmployeeValidity: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.EMPLOYEES.SET_VALIDITY(id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Employees',
        { type: 'Employees', id },
      ],
    }),
    deleteEmployeeValidity: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.EMPLOYEES.REMOVE_VALIDITY(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        'Employees',
        { type: 'Employees', id },
      ],
    }),
    uploadDocument: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.EMPLOYEES.UPLOAD,
        method: 'POST',
        body,
      }),
    }),
    resetEmployeePassword: builder.mutation<
      { message: string },
      { id: string; password: string }
    >({
      query: ({ id, password }) => ({
        url: API_ROUTES.EMPLOYEES.RESET_PASSWORD(id),
        method: 'PATCH',
        body: { password },
      }),
    }),

    // Job endpoints
    getJobs: builder.query<JobsResponse, ListQueryParams>({
      query: ({ page = 1, limit = 10, search, status, sort }) => ({
        url: API_ROUTES.JOBS.LIST,
        params: { page, limit, search, status, sort },
      }),
      providesTags: ['Jobs'],
    }),
    getJobById: builder.query<IJob, string>({
      query: (id: string) => API_ROUTES.JOBS.DETAILS(id),
      providesTags: (_result, _error, id) => [{ type: 'Jobs', id }],
    }),
    createJob: builder.mutation<JobMutationResponse, Partial<IJob>>({
      query: (job) => ({
        url: API_ROUTES.JOBS.CREATE,
        method: 'POST',
        body: job,
      }),
      invalidatesTags: ['Jobs'],
    }),
    updateJob: builder.mutation<
      JobMutationResponse,
      { id: string } & Partial<IJob>
    >({
      query: ({ id, ...job }) => ({
        url: API_ROUTES.JOBS.UPDATE(id),
        method: 'PUT',
        body: job,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Jobs',
        { type: 'Jobs', id },
      ],
    }),
    deleteJob: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.JOBS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Jobs'],
    }),
    cancelJob: builder.mutation<void, { jobId: string }>({
      query: ({ jobId }) => ({
        url: API_ROUTES.JOBS.CANCEL,
        method: 'POST',
        body: { jobId },
      }),
      invalidatesTags: (_result, _error, { jobId }) => [
        'Jobs',
        { type: 'Jobs', id: jobId },
      ],
    }),
    completeJob: builder.mutation<
      void,
      {
        jobId: string;
        receivePrice?: number;
        items?: OrderItemInput[];
        completedDate?: string;
        // title?: string;
        address?: string;
        jobType?: string;
        price?: number;
        notes?: string;
        description?: string;
        preferredTiming?: string;
        paymentType?: string;
        jobDate?: string;
        frequency?: { value: number; unit: string };
      }
    >({
      query: ({ items, ...rest }) => ({
        url: API_ROUTES.JOBS.COMPLETE,
        method: 'POST',
        body: { ...rest, dataForInvoices: items },
      }),
      invalidatesTags: (_result, _error, { jobId }) => [
        'Jobs',
        { type: 'Jobs', id: jobId },
      ],
    }),
    assignJobEmployee: builder.mutation<
      void,
      { id: string; employee: string }
    >({
      query: ({ id, employee }) => ({
        url: API_ROUTES.JOBS.ASSIGN_EMPLOYEE,
        method: 'PATCH',
        body: { jobId: id, employee },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Jobs',
        { type: 'Jobs', id },
      ],
    }),
    getJobReceipt: builder.query<unknown, string>({
      query: (id) => API_ROUTES.JOBS.RECEIPT(id),
    }),
    createJobReceipt: builder.mutation<unknown, string>({
      query: (jobId) => ({
        url: API_ROUTES.JOBS.RECEIPT(jobId),
        method: 'POST',
      }),
      invalidatesTags: ['Invoices', 'Jobs'],
    }),
    updateJobDate: builder.mutation<
      void,
      { jobId: string; jobDate: string }
    >({
      query: ({ jobId, jobDate }) => ({
        url: API_ROUTES.JOBS.DATE(jobId),
        method: 'PATCH',
        body: { jobDate },
      }),
      invalidatesTags: (_result, _error, { jobId }) => [
        'Jobs',
        'ChildJobs',
        { type: 'Jobs', jobId },
      ],
    }),

    // Parent Job endpoints
    getParentJobs: builder.query<ParentJobsResponse, ListQueryParams>(
      {
        query: ({
          page = 1,
          limit = 10,
          search,
          status,
          sort,
          jobType,
        }) => ({
          url: API_ROUTES.PARENT_JOBS.LIST,
          params: { page, limit, search, status, sort, jobType },
        }),
        providesTags: ['ParentJobs'],
      },
    ),
    cancelParentJob: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.PARENT_JOBS.CANCEL(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['ParentJobs'],
    }),

    // Child Job endpoints
    getChildJobs: builder.query<ChildJobsResponse, ListQueryParams>({
      query: ({ page = 1, limit = 10, search, status, sort }) => ({
        url: API_ROUTES.CHILD_JOBS.LIST,
        params: { page, limit, search, status, sort },
      }),
      providesTags: ['ChildJobs'],
    }),
    getChildJobsByParentId: builder.query<
      ChildJobsResponse,
      {
        parentJobId: string;
        page?: number;
        limit?: number;
        status?: string;
        sort?: string;
      }
    >({
      query: ({
        parentJobId,
        page = 1,
        limit = 10,
        status,
        sort,
      }) => ({
        url: API_ROUTES.CHILD_JOBS.BY_PARENT(parentJobId),
        params: { page, limit, status, sort },
      }),
      providesTags: ['ChildJobs'],
    }),
    updateChildJobStatus: builder.mutation<
      void,
      { jobId: string; status: string }
    >({
      query: ({ jobId, status }) => ({
        url: API_ROUTES.CHILD_JOBS.STATUS(jobId),
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { jobId }) => [
        'ChildJobs',
        { type: 'ChildJobs', id: jobId },
      ],
    }),

    // Invoice endpoints
    getInvoices: builder.query<InvoicesResponse, ListQueryParams>({
      query: ({ page = 1, limit = 10, search, status, sort }) => ({
        url: API_ROUTES.INVOICES.LIST,
        params: { page, limit, search, paymentStatus: status, sort },
      }),
      providesTags: ['Invoices'],
    }),
    getInvoiceByJobId: builder.query<IInvoice, string>({
      query: (jobId: string) =>
        API_ROUTES.INVOICES.VIEW_BY_JOB(jobId),
      providesTags: (_result, _error, jobId) => [
        { type: 'Invoices', jobId },
      ],
    }),
    downloadInvoice: builder.query<Blob, string>({
      query: (jobId: string) => ({
        url: API_ROUTES.INVOICES.DOWNLOAD(jobId),
        responseHandler: (response: Response) => response.blob(),
      }),
      keepUnusedDataFor: 0,
    }),
    getReceipt: builder.query<Blob, string>({
      query: (jobId: string) => ({
        url: API_ROUTES.INVOICES.VIEW_BY_JOB(jobId),
        responseHandler: (response: Response) => response.blob(),
      }),
      keepUnusedDataFor: 0,
    }),

    resendInvoice: builder.mutation<void, string>({
      query: (jobId: string) => ({
        url: API_ROUTES.INVOICES.RESEND(jobId),
        method: 'POST',
      }),
      invalidatesTags: ['Invoices'],
    }),

    updatePaymentStatus: builder.mutation<
      IInvoice,
      { jobId: string; paymentStatus: string }
    >({
      query: ({ jobId, paymentStatus }) => ({
        url: API_ROUTES.INVOICES.PAYMENT_STATUS(jobId),
        method: 'PATCH',
        body: { paymentStatus },
      }),
      invalidatesTags: ['Invoices'],
    }),

    // Notification endpoints
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => API_ROUTES.NOTIFICATIONS.LIST,
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.NOTIFICATIONS.MARK_READ(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.NOTIFICATIONS.MARK_ALL_READ,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.NOTIFICATIONS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
    deleteAllNotifications: builder.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.NOTIFICATIONS.DELETE_ALL,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Super Admin - Admin Users endpoints
    getAdminUsers: builder.query<GetAdminsResponse, GetAdminsParams>({
      query: ({ page = 1, limit = 10, search, status, sort }) => ({
        url: API_ROUTES.SUPER_ADMINS.ADMINS.LIST,

        params: {
          page,
          limit,
          search,
          status,
          sort,
        },
      }),

      providesTags: ['Admins'],
    }),
    getAdminUserById: builder.query<IAdminUser, string>({
      query: (id) => API_ROUTES.SUPER_ADMINS.ADMINS.DETAILS(id),
      providesTags: (_result, _error, id) => [{ type: 'Admins', id }],
    }),
    createAdminUser: builder.mutation<
      IAdminUser,
      Partial<IAdminUser>
    >({
      query: (admin) => ({
        url: API_ROUTES.SUPER_ADMINS.ADMINS.CREATE,
        method: 'POST',
        body: admin,
      }),
      invalidatesTags: ['Admins'],
    }),
    updateAdminUser: builder.mutation<
      IAdminUser,
      { id: string } & Partial<IAdminUser>
    >({
      query: ({ id, ...admin }) => ({
        url: API_ROUTES.SUPER_ADMINS.ADMINS.UPDATE(id),
        method: 'PUT',
        body: admin,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Admins',
        { type: 'Admins', id },
      ],
    }),
    setAdminValidity: builder.mutation<
      IAdminUser,
      { id: string } & Partial<IAdminUser>
    >({
      query: ({ id, ...admin }) => ({
        url: API_ROUTES.SUPER_ADMINS.ADMINS.SET_VALIDITY(id),
        method: 'PATCH',
        body: admin,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Admins',
        { type: 'Admins', id },
      ],
    }),
    deleteAdminValidity: builder.mutation<
      IAdminUser,
      { id: string } & Partial<IAdminUser>
    >({
      query: ({ id, ...admin }) => ({
        url: API_ROUTES.SUPER_ADMINS.ADMINS.REMOVE_VALIDITY(id),
        method: 'DELETE',
        body: admin,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Admins',
        { type: 'Admins', id },
      ],
    }),
    deleteAdminUser: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.SUPER_ADMINS.ADMINS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Admins'],
    }),

    // Admin self-service endpoints
    getAdminDetails: builder.query<
      { admin: IAdminUser; stats: IAdminStats },
      void
    >({
      query: () => API_ROUTES.ADMINS.SELF,
      providesTags: ['Admins'],
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.admin?.profileImage) {
            dispatch(
              updateUser({ profileImage: data.admin.profileImage }),
            );
          }
        } catch {
          /* silenty fail */
        }
      },
    }),
    updateProfile: builder.mutation<
      { admin: IAdminUser },
      Partial<IAdminUser>
    >({
      query: (body) => ({
        url: API_ROUTES.ADMINS.PROFILE,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Admins'],
    }),
    getDashboardAnalytics: builder.query<
      IDashboardAnalytics,
      { year?: number }
    >({
      query: ({ year }) => ({
        url: API_ROUTES.ADMINS.DASHBOARD_ANALYTICS,
        params: { year },
      }),
    }),

    // Password Reset endpoints
    forgotPassword: builder.mutation<
      { message: string },
      { email: string }
    >({
      query: (body) => ({
        url: API_ROUTES.AUTH.FORGOT_PASSWORD,
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation<
      { token: string },
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: API_ROUTES.AUTH.VERIFY_OTP,
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<
      { message: string },
      { token: string; newPassword: string }
    >({
      query: (body) => ({
        url: API_ROUTES.AUTH.RESET_PASSWORD,
        method: 'POST',
        body,
      }),
    }),

    // Auth - Change Password
    changePassword: builder.mutation<
      { message: string },
      { oldPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: API_ROUTES.ADMINS.CHANGE_PASSWORD,
        method: 'PATCH',
        body,
      }),
    }),
    // superAdminChangePassword: builder.mutation<
    //   { message: string },
    //   { oldPassword: string; newPassword: string }
    // >({
    //   query: (body) => ({
    //     url: API_ROUTES.SUPER_ADMINS.CHANGE_PASSWORD,
    //     method: 'PATCH',
    //     body,
    //   }),
    // }),

    // Super Admin - Billing endpoints
    // getBillingStats: builder.query<Record<string, unknown>, void>({
    //   query: () => API_ROUTES.SUPER_ADMINS.BILLING.STATS,
    //   providesTags: ['Billing'],
    // }),
    // getBillingInvoices: builder.query<unknown[], void>({
    //   query: () => API_ROUTES.SUPER_ADMINS.BILLING.INVOICES,
    //   providesTags: ['Billing'],
    // }),

    // Training endpoints
    getTrainings: builder.query<TrainingsResponse, TrainingsParams>({
      query: ({ page = 1, limit = 10, search, isActive }) => ({
        url: API_ROUTES.TRAININGS.LIST,
        params: { page, limit, search, isActive },
      }),
      providesTags: ['Trainings'],
    }),
    getTraining: builder.query<ITraining, string>({
      query: (id) => API_ROUTES.TRAININGS.DETAILS(id),
      providesTags: (_result, _error, id) => [
        { type: 'Trainings', id },
      ],
    }),
    createTraining: builder.mutation<
      ITraining,
      { title: string; description: string; videoUrl: string }
    >({
      query: (body) => ({
        url: API_ROUTES.TRAININGS.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Trainings'],
    }),
    updateTraining: builder.mutation<
      ITraining,
      { id: string } & {
        title: string;
        description: string;
        videoUrl: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.TRAININGS.UPDATE(id),
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Trainings',
        { type: 'Trainings', id },
      ],
    }),
    deleteTraining: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.TRAININGS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Trainings'],
    }),
    toggleTrainingStatus: builder.mutation<ITraining, string>({
      query: (id) => ({
        url: API_ROUTES.TRAININGS.TOGGLE_STATUS(id),
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        'Trainings',
        { type: 'Trainings', id },
      ],
    }),

    // Expense endpoints
    getExpenses: builder.query<ExpensesResponse, ListQueryParams>({
      query: (params) => ({
        url: API_ROUTES.EXPENSES.LIST,
        params,
      }),
      providesTags: ['Expenses'],
    }),
    getExpenseById: builder.query<IExpense, string>({
      query: (id) => API_ROUTES.EXPENSES.DETAILS(id),
      providesTags: (_result, _error, id) => [
        { type: 'Expenses', id },
      ],
    }),
    createExpense: builder.mutation<
      ExpenseMutationResponse,
      Partial<IExpense>
    >({
      query: (body) => ({
        url: API_ROUTES.EXPENSES.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Expenses'],
    }),
    updateExpense: builder.mutation<
      ExpenseMutationResponse,
      { id: string } & Partial<IExpense>
    >({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.EXPENSES.UPDATE(id),
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Expenses',
        { type: 'Expenses', id },
      ],
    }),
    deleteExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.EXPENSES.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Expenses'],
    }),
    getFinancialReport: builder.query<
      FinancialReportResponse,
      ListQueryParams
    >({
      query: (params) => ({
        url: API_ROUTES.REPORTS.FINANCIAL,
        params,
      }),
    }),
    toggleExpenseStatus: builder.mutation<IExpense, string>({
      query: (id) => ({
        url: API_ROUTES.EXPENSES.STATUS(id),
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        'Expenses',
        { type: 'Expenses', id },
      ],
    }),

    getWalletHistory: builder.query<
      IWalletHistoryResponse,
      WalletHistoryQueryParams
    >({
      query: ({ engineerId, page = 1, limit = 10 }) => ({
        url: API_ROUTES.ADMINS.WALLET_HISTORY,
        params: { engineerId, page, limit },
      }),
      providesTags: ['Wallet'],
    }),
    getAdminWalletHistory: builder.query<
      IAdminWalletHistoryResponse,
      AdminWalletHistoryQueryParams
    >({
      query: ({ startDate, endDate }) => ({
        url: API_ROUTES.ADMINS.WALLET_MY_HISTORY,
        params: { startDate, endDate },
      }),
      providesTags: ['Wallet'],
    }),
    settleWallet: builder.mutation<
      ISettlementResponse,
      ISettlementPayload
    >({
      query: (body) => ({
        url: API_ROUTES.ADMINS.WALLET_SETTLEMENT,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'Employees'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSuperLoginMutation,
  useLogoutMutation,

  useSubscribeNotificationMutation,
  useUnsubscribeNotificationMutation,

  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useToggleCustomerStatusMutation,

  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useToggleEmployeeStatusMutation,
  useSetEmployeeValidityMutation,
  useDeleteEmployeeValidityMutation,
  useUploadDocumentMutation,
  useResetEmployeePasswordMutation,

  useGetJobsQuery,
  useGetJobByIdQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useCancelJobMutation,
  useCompleteJobMutation,
  useAssignJobEmployeeMutation,
  useGetJobReceiptQuery,
  useCreateJobReceiptMutation,
  useUpdateJobDateMutation,

  useGetParentJobsQuery,
  useCancelParentJobMutation,
  useGetChildJobsQuery,
  useGetChildJobsByParentIdQuery,
  useUpdateChildJobStatusMutation,

  useGetInvoicesQuery,
  useGetInvoiceByJobIdQuery,
  useDownloadInvoiceQuery,
  useLazyDownloadInvoiceQuery,
  useGetReceiptQuery,
  useLazyGetReceiptQuery,

  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,

  useResendInvoiceMutation,
  useUpdatePaymentStatusMutation,

  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useSetAdminValidityMutation,
  useDeleteAdminValidityMutation,

  useGetAdminDetailsQuery,
  useUpdateProfileMutation,
  useGetDashboardAnalyticsQuery,

  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  // useSuperAdminChangePasswordMutation,

  // useGetBillingStatsQuery,
  // useGetBillingInvoicesQuery,

  useGetTrainingsQuery,
  useGetTrainingQuery,
  useCreateTrainingMutation,
  useUpdateTrainingMutation,
  useDeleteTrainingMutation,
  useToggleTrainingStatusMutation,

  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useToggleExpenseStatusMutation,

  useGetFinancialReportQuery,
  useGetWalletHistoryQuery,
  useGetAdminWalletHistoryQuery,
  useSettleWalletMutation,
} = api;
