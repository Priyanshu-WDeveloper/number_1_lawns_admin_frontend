import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { getDeviceToken, getDeviceType } from '../lib/device';
import { getToken } from '../lib/auth';
import type {
  CustomersResponse,
  CustomerMutationResponse,
  GetAdminsParams,
  GetAdminsResponse,
  GetCustomersParams,
  EmployeesResponse,
  JobsResponse,
  InvoicesResponse,
  NotificationsResponse,
  ListQueryParams,
  UpdateEmployeePayload,
} from '../types/api.types';
import type {
  CreateEmployeePayload,
} from '../types/employees.types';
import { setAuth, clearAuth } from '../store/auth-slice';
import { API_ROUTES } from '../constants';
import type {
  ICustomer,
  IEmployee,
  IJob,
  IInvoice,
  IAdminUser,
} from '../types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = getToken();

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: [
    'Customers',
    'Employees',
    'Jobs',
    'Invoices',
    'Admins',
    'Billing',
    'Notifications',
  ],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: 'POST',
        body: {
          ...credentials,
          deviceType: getDeviceType(),
          deviceToken: getDeviceToken(),
        },
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            dispatch(
              setAuth({
                user: data.user,
                token: data.token,
                rememberMe: true,
              }),
            );
          }
        } catch {
          /* handled by caller */
        }
      },
    }),
    superLogin: builder.mutation({
      query: (credentials) => ({
        url: API_ROUTES.AUTH.SUPER_LOGIN,
        method: 'POST',
        body: {
          ...credentials,
          deviceType: getDeviceType(),
          deviceToken: getDeviceToken(),
        },
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            dispatch(
              setAuth({
                user: data.user,
                token: data.token,
                rememberMe: true,
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
          status,
        },
      }),

      invalidatesTags: ['Customers'],
    }),

    // Employee endpoints
    getEmployees: builder.query<EmployeesResponse, ListQueryParams>({
      query: (params) => ({
        url: API_ROUTES.EMPLOYEES.LIST,
        params,
      }),
      providesTags: ['Employees'],
    }),

    getEmployeeById: builder.query<IEmployee, string>({
      query: (id) => API_ROUTES.EMPLOYEES.DETAILS(id),
      providesTags: (_result, _error, id) => [
        { type: 'Employees', id },
      ],
    }),

    createEmployee: builder.mutation<
      IEmployee,
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
      IEmployee,
      UpdateEmployeePayload
    >({
      query: ({ id, ...employee }) => ({
        url: API_ROUTES.EMPLOYEES.UPDATE(id),
        method: 'PUT',
        body: employee,
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
          status,
        },
      }),

      invalidatesTags: ['Employees'],
    }),

    setEmployeeValidity: builder.mutation<
      IEmployee,
      { id: string; validity: string | null }
    >({
      query: ({ id, ...data }) => ({
        url: API_ROUTES.EMPLOYEES.SET_VALIDITY(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Employees',
        { type: 'Employees', id },
      ],
    }),

    deleteEmployeeValidity: builder.mutation<
      IEmployee,
      { id: string }
    >({
      query: ({ id }) => ({
        url: API_ROUTES.EMPLOYEES.REMOVE_VALIDITY(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Employees',
        { type: 'Employees', id },
      ],
    }),

    // Job endpoints
    getJobs: builder.query<JobsResponse, void>({
      query: () => API_ROUTES.JOBS.LIST,
      providesTags: ['Jobs'],
    }),
    getJobById: builder.query<IJob, string>({
      query: (id) => API_ROUTES.JOBS.DETAILS(id),
      providesTags: (_result, _error, id) => [{ type: 'Jobs', id }],
    }),
    createJob: builder.mutation<IJob, Partial<IJob>>({
      query: (job) => ({
        url: API_ROUTES.JOBS.CREATE,
        method: 'POST',
        body: job,
      }),
      invalidatesTags: ['Jobs'],
    }),
    updateJob: builder.mutation<IJob, { id: string } & Partial<IJob>>(
      {
        query: ({ id, ...job }) => ({
          url: API_ROUTES.JOBS.UPDATE(id),
          method: 'PATCH',
          body: job,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          'Jobs',
          { type: 'Jobs', id },
        ],
      },
    ),
    deleteJob: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.JOBS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Jobs'],
    }),

    // Invoice endpoints
    getInvoices: builder.query<InvoicesResponse, void>({
      query: () => API_ROUTES.INVOICES.LIST,
      providesTags: ['Invoices'],
    }),
    getInvoiceById: builder.query<IInvoice, string>({
      query: (id) => API_ROUTES.INVOICES.DETAILS(id),
      providesTags: (_result, _error, id) => [
        { type: 'Invoices', id },
      ],
    }),
    createInvoice: builder.mutation<IInvoice, Partial<IInvoice>>({
      query: (invoice) => ({
        url: API_ROUTES.INVOICES.CREATE,
        method: 'POST',
        body: invoice,
      }),
      invalidatesTags: ['Invoices'],
    }),
    updateInvoice: builder.mutation<
      IInvoice,
      { id: string } & Partial<IInvoice>
    >({
      query: ({ id, ...invoice }) => ({
        url: API_ROUTES.INVOICES.UPDATE(id),
        method: 'PATCH',
        body: invoice,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Invoices',
        { type: 'Invoices', id },
      ],
    }),
    deleteInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.INVOICES.DELETE(id),
        method: 'DELETE',
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

    // Super Admin - Billing endpoints
    getBillingStats: builder.query<Record<string, unknown>, void>({
      query: () => API_ROUTES.SUPER_ADMINS.BILLING.STATS,
      providesTags: ['Billing'],
    }),
    getBillingInvoices: builder.query<unknown[], void>({
      query: () => API_ROUTES.SUPER_ADMINS.BILLING.INVOICES,
      providesTags: ['Billing'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSuperLoginMutation,
  useLogoutMutation,

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

  useGetJobsQuery,
  useGetJobByIdQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,

  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,

  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,

  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useSetAdminValidityMutation,
  useDeleteAdminValidityMutation,

  useGetBillingStatsQuery,
  useGetBillingInvoicesQuery,
} = api;
