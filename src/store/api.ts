import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { getDeviceToken, getDeviceType } from '../lib/device';
import type {
  GetAdminsParams,
  GetAdminsResponse,
} from '../types/api.types';
// import type { IAdmins } from '../types/admins.types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');

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
  ],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/superadmins/login',
        method: 'POST',
        body: {
          ...credentials,
          deviceType: getDeviceType(),
          deviceToken: getDeviceToken(),
        },
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),

      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;

          // remove token
          localStorage.removeItem('token');

          // optional: clear other auth data
          localStorage.removeItem('user');
        } catch (error) {
          console.error('Logout failed', error);
        }
      },
    }),

    // Customer endpoints
    getCustomers: builder.query({
      query: () => '/customers',
      providesTags: ['Customers'],
    }),
    getCustomerById: builder.query({
      query: (id) => `/customers/${id}`,
      providesTags: (_result, _error, id) => [
        { type: 'Customers', id },
      ],
    }),
    createCustomer: builder.mutation({
      query: (customer) => ({
        url: '/customers',
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customers'],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...customer }) => ({
        url: `/customers/${id}`,
        method: 'PATCH',
        body: customer,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customers', id },
      ],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customers'],
    }),

    // Employee endpoints
    getEmployees: builder.query({
      query: () => '/employees',
      providesTags: ['Employees'],
    }),
    getEmployeeById: builder.query({
      query: (id) => `/employees/${id}`,
      providesTags: (_result, _error, id) => [
        { type: 'Employees', id },
      ],
    }),
    createEmployee: builder.mutation({
      query: (employee) => ({
        url: '/employees',
        method: 'POST',
        body: employee,
      }),
      invalidatesTags: ['Employees'],
    }),
    updateEmployee: builder.mutation({
      query: ({ id, ...employee }) => ({
        url: `/employees/${id}`,
        method: 'PATCH',
        body: employee,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Employees', id },
      ],
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employees'],
    }),

    // Job endpoints
    getJobs: builder.query({
      query: () => '/jobs',
      providesTags: ['Jobs'],
    }),
    getJobById: builder.query({
      query: (id) => `/jobs/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Jobs', id }],
    }),
    createJob: builder.mutation({
      query: (job) => ({
        url: '/jobs',
        method: 'POST',
        body: job,
      }),
      invalidatesTags: ['Jobs'],
    }),
    updateJob: builder.mutation({
      query: ({ id, ...job }) => ({
        url: `/jobs/${id}`,
        method: 'PATCH',
        body: job,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Jobs', id },
      ],
    }),
    deleteJob: builder.mutation({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Jobs'],
    }),

    // Invoice endpoints
    getInvoices: builder.query({
      query: () => '/invoices',
      providesTags: ['Invoices'],
    }),
    getInvoiceById: builder.query({
      query: (id) => `/invoices/${id}`,
      providesTags: (_result, _error, id) => [
        { type: 'Invoices', id },
      ],
    }),
    createInvoice: builder.mutation({
      query: (invoice) => ({
        url: '/invoices',
        method: 'POST',
        body: invoice,
      }),
      invalidatesTags: ['Invoices'],
    }),
    updateInvoice: builder.mutation({
      query: ({ id, ...invoice }) => ({
        url: `/invoices/${id}`,
        method: 'PATCH',
        body: invoice,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Invoices', id },
      ],
    }),
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/invoices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Invoices'],
    }),

    // Super Admin - Admin Users endpoints
    // IAdmins[],
    //
    getAdminUsers: builder.query<GetAdminsResponse, GetAdminsParams>({
      query: ({ page = 1, limit = 10, search, status, sort }) => ({
        url: 'superadmins/admins',

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
    getAdminUserById: builder.query({
      query: (id) => `/super-admin/admins/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Admins', id }],
    }),
    createAdminUser: builder.mutation({
      query: (admin) => ({
        url: '/super-admin/admins',
        method: 'POST',
        body: admin,
      }),
      invalidatesTags: ['Admins'],
    }),
    updateAdminUser: builder.mutation({
      query: ({ id, ...admin }) => ({
        url: `/super-admin/admins/${id}`,
        method: 'PATCH',
        body: admin,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Admins', id },
      ],
    }),
    deleteAdminUser: builder.mutation({
      query: (id) => ({
        url: `/super-admin/admins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admins'],
    }),

    // Super Admin - Billing endpoints
    getBillingStats: builder.query({
      query: () => '/super-admin/billing/stats',
      providesTags: ['Billing'],
    }),
    getBillingInvoices: builder.query({
      query: () => '/super-admin/billing/invoices',
      providesTags: ['Billing'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,

  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
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
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetBillingStatsQuery,
  useGetBillingInvoicesQuery,
} = api;
