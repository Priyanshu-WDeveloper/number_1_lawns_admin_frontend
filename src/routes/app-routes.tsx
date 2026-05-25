import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  PublicRoute,
  ProtectedRoute,
  SuperAdminRoute,
} from '@/components/route-guards';
import { ROUTES } from '@/constants';
import Loader from '@/components/loader';

const Login = React.lazy(() => import('../pages/auth/login'));
const SuperAdminLogin = React.lazy(() => import('../pages/auth/super-admin-login'));
const ForgotPassword = React.lazy(() => import('../pages/auth/forgot-password'));
const DashboardPage = React.lazy(() => import('../pages/admin/dashboard'));
const AdminProfilePage = React.lazy(() => import('../pages/admin/profile'));
const SuperAdminProfilePage = React.lazy(() => import('../pages/super-admin/profile'));
const SuperAdminDashboardPage = React.lazy(() => import('../pages/super-admin/dashboard'));
const SuperAdminBillingPage = React.lazy(() => import('../pages/super-admin/billing'));
const CustomerManagementPage = React.lazy(() => import('../pages/admin/customers'));
const CreateCustomerPage = React.lazy(() => import('../pages/admin/customers/create'));
const CustomerViewPage = React.lazy(() => import('../pages/admin/customers/view'));
const CustomerEditPage = React.lazy(() => import('../pages/admin/customers/edit'));
const EmployeeManagementPage = React.lazy(() => import('../pages/admin/employees'));
const CreateEmployeePage = React.lazy(() => import('../pages/admin/employees/create'));
const EmployeeViewPage = React.lazy(() => import('../pages/admin/employees/view'));
const EmployeeEditPage = React.lazy(() => import('../pages/admin/employees/edit'));
const JobManagementPage = React.lazy(() => import('../pages/admin/jobs'));
const CreateJobPage = React.lazy(() => import('../pages/admin/jobs/create'));
const JobViewPage = React.lazy(() => import('../pages/admin/jobs/view'));
const JobEditPage = React.lazy(() => import('../pages/admin/jobs/edit'));
const NotificationsPage = React.lazy(() => import('../pages/notification'));
const InvoiceManagementPage = React.lazy(() => import('../pages/admin/invoices'));
const InvoiceViewPage = React.lazy(() => import('../pages/admin/invoices/view'));
const SuperAdminAdminsPage = React.lazy(() => import('../pages/super-admin/admin'));
const AdminCreatePage = React.lazy(() => import('../pages/super-admin/admin/create'));
const AdminViewPage = React.lazy(() => import('../pages/super-admin/admin/view'));
const AdminEditPage = React.lazy(() => import('../pages/super-admin/admin/edit'));
const NotFoundPage = React.lazy(() => import('../pages/not-found'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.FORGOT_PASSWORD}
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.SUPER_ADMIN_LOGIN}
          element={
            <PublicRoute>
              <SuperAdminLogin />
            </PublicRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <AdminProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMERS}
          element={
            <ProtectedRoute>
              <CustomerManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMERS_CREATE}
          element={
            <ProtectedRoute>
              <CreateCustomerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMERS_VIEW}
          element={
            <ProtectedRoute>
              <CustomerViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CUSTOMERS_EDIT}
          element={
            <ProtectedRoute>
              <CustomerEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EMPLOYEES}
          element={
            <ProtectedRoute>
              <EmployeeManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EMPLOYEES_CREATE}
          element={
            <ProtectedRoute>
              <CreateEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EMPLOYEES_VIEW}
          element={
            <ProtectedRoute>
              <EmployeeViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EMPLOYEES_EDIT}
          element={
            <ProtectedRoute>
              <EmployeeEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.JOBS}
          element={
            <ProtectedRoute>
              <JobManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.JOBS_CREATE}
          element={
            <ProtectedRoute>
              <CreateJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.JOBS_VIEW}
          element={
            <ProtectedRoute>
              <JobViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.JOBS_EDIT}
          element={
            <ProtectedRoute>
              <JobEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.INVOICES}
          element={
            <ProtectedRoute>
              <InvoiceManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.INVOICES_VIEW}
          element={
            <ProtectedRoute>
              <InvoiceViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.NOTIFICATIONS}
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Super Admin Protected Routes */}
        <Route
          path={ROUTES.SUPER_ADMIN_DASHBOARD}
          element={
            <SuperAdminRoute>
              <SuperAdminDashboardPage />
            </SuperAdminRoute>
          }
        />
        <Route
          path={ROUTES.SUPER_ADMIN_PROFILE}
          element={
            <SuperAdminRoute>
              <SuperAdminProfilePage />
            </SuperAdminRoute>
          }
        />
        <Route
          path={ROUTES.SUPER_ADMIN_ADMINS}
          element={
            <SuperAdminRoute>
              <SuperAdminAdminsPage />
            </SuperAdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_CREATE}
          element={
            <SuperAdminRoute>
              <AdminCreatePage />
            </SuperAdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_VIEW}
          element={
            <SuperAdminRoute>
              <AdminViewPage />
            </SuperAdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_EDIT}
          element={
            <SuperAdminRoute>
              <AdminEditPage />
            </SuperAdminRoute>
          }
        />
        <Route
          path={ROUTES.SUPER_ADMIN_BILLING}
          element={
            <SuperAdminRoute>
              <SuperAdminBillingPage />
            </SuperAdminRoute>
          }
        />
        <Route
          path={ROUTES.SUPER_ADMIN_NOTIFICATIONS}
          element={
            <SuperAdminRoute>
              <NotificationsPage />
            </SuperAdminRoute>
          }
        />

        {/* Root and Catch-all */}
        <Route
          path="/"
          element={<Navigate to={ROUTES.LOGIN} replace />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
