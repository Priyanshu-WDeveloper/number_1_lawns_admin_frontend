import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  PublicRoute,
  ProtectedRoute,
  SuperAdminRoute,
} from '@/components/route-guards';
import { ROUTES } from '@/constants';
import Login from '../pages/auth/login';
import SuperAdminLogin from '../pages/auth/super-admin-login';
import ForgotPassword from '../pages/auth/forgot-password';
import DashboardPage from '../pages/dashboard/DashboardPage';
import SuperAdminDashboardPage from '../pages/super-admin/dashboard';
import SuperAdminBillingPage from '../pages/super-admin/billing';
import CustomerManagementPage from '../pages/customers';
import CreateCustomerPage from '../pages/customers/create';
import CustomerViewPage from '../pages/customers/view';
import EmployeeManagementPage from '../pages/employees';
import CreateEmployeePage from '../pages/employees/create';
import EmployeeViewPage from '../pages/employees/view';
import JobManagementPage from '../pages/jobs';
import CreateJobPage from '../pages/jobs/create';
import JobViewPage from '../pages/jobs/view';
import NotificationsPage from '../pages/notification';
import InvoiceManagementPage from '../pages/invoices';
import SuperAdminAdminsPage from '../pages/super-admin/admin';
import AdminCreatePage from '../pages/super-admin/admin/create';
import AdminViewPage from '../pages/super-admin/admin/view';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute redirectTo={ROUTES.DASHBOARD}>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={
          <PublicRoute redirectTo={ROUTES.DASHBOARD}>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.SUPER_ADMIN_LOGIN}
        element={
          <PublicRoute redirectTo={ROUTES.SUPER_ADMIN_DASHBOARD}>
            <SuperAdminLogin />
          </PublicRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CUSTOMERS}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <CustomerManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CUSTOMERS_CREATE}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <CreateCustomerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CUSTOMERS_VIEW}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <CustomerViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.EMPLOYEES}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <EmployeeManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.EMPLOYEES_CREATE}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <CreateEmployeePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.EMPLOYEES_VIEW}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <EmployeeViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.JOBS}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <JobManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.JOBS_CREATE}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <CreateJobPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.JOBS_VIEW}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <JobViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.INVOICES}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <InvoiceManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.NOTIFICATIONS}
        element={
          <ProtectedRoute redirectTo={ROUTES.LOGIN}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Super Admin Protected Routes */}
      <Route
        path={ROUTES.SUPER_ADMIN_DASHBOARD}
        element={
          <SuperAdminRoute redirectTo={ROUTES.SUPER_ADMIN_LOGIN}>
            <SuperAdminDashboardPage />
          </SuperAdminRoute>
        }
      />
      <Route
        path={ROUTES.SUPER_ADMIN_ADMINS}
        element={
          <SuperAdminRoute redirectTo={ROUTES.SUPER_ADMIN_LOGIN}>
            <SuperAdminAdminsPage />
          </SuperAdminRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_CREATE}
        element={
          <SuperAdminRoute redirectTo={ROUTES.SUPER_ADMIN_LOGIN}>
            <AdminCreatePage />
          </SuperAdminRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_VIEW}
        element={
          <SuperAdminRoute redirectTo={ROUTES.SUPER_ADMIN_LOGIN}>
            <AdminViewPage />
          </SuperAdminRoute>
        }
      />
      <Route
        path={ROUTES.SUPER_ADMIN_BILLING}
        element={
          <SuperAdminRoute redirectTo={ROUTES.SUPER_ADMIN_LOGIN}>
            <SuperAdminBillingPage />
          </SuperAdminRoute>
        }
      />
      <Route
        path={ROUTES.SUPER_ADMIN_NOTIFICATIONS}
        element={
          <SuperAdminRoute redirectTo={ROUTES.SUPER_ADMIN_LOGIN}>
            <NotificationsPage />
          </SuperAdminRoute>
        }
      />

      {/* Root and Catch-all */}
      <Route
        path="/"
        element={<Navigate to={ROUTES.LOGIN} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={ROUTES.LOGIN} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
