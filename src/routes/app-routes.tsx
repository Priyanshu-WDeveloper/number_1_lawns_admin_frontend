import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  PublicRoute,
  ProtectedRoute,
} from '@/components/route-guards';
import { ROUTES } from '@/constants';
import Loader from '@/components/loader';

const Login = React.lazy(() => import('../pages/auth/login'));
const ImpersonateHandler = React.lazy(
  () => import('../pages/auth/impersonate'),
);
const ForgotPassword = React.lazy(
  () => import('../pages/auth/forgot-password'),
);
const DashboardPage = React.lazy(
  () => import('../pages/admin/dashboard'),
);
const AdminProfilePage = React.lazy(
  () => import('../pages/admin/profile'),
);
const ChangePasswordPage = React.lazy(() => import('../pages/admin/change-password'));
const CustomerManagementPage = React.lazy(
  () => import('../pages/admin/customers'),
);
const CreateCustomerPage = React.lazy(
  () => import('../pages/admin/customers/create'),
);
const CustomerViewPage = React.lazy(
  () => import('../pages/admin/customers/view'),
);
const CustomerEditPage = React.lazy(
  () => import('../pages/admin/customers/edit'),
);
const EmployeeManagementPage = React.lazy(
  () => import('../pages/admin/employees'),
);
const CreateEmployeePage = React.lazy(
  () => import('../pages/admin/employees/create'),
);
const EmployeeViewPage = React.lazy(
  () => import('../pages/admin/employees/view'),
);
const EmployeeEditPage = React.lazy(
  () => import('../pages/admin/employees/edit'),
);
const CreateJobPage = React.lazy(
  () => import('../pages/admin/jobs/create'),
);
const JobViewPage = React.lazy(
  () => import('../pages/admin/jobs/view'),
);
const JobManageViewPage = React.lazy(
  () => import('../pages/admin/jobs/manage-view'),
);
const JobEditPage = React.lazy(
  () => import('../pages/admin/jobs/edit'),
);
const ManageJobsPage = React.lazy(
  () => import('../pages/admin/jobs/manage'),
);
const ScheduledJobsPage = React.lazy(
  () => import('../pages/admin/jobs/scheduled'),
);
const NotificationsPage = React.lazy(
  () => import('../pages/notification'),
);
const InvoiceManagementPage = React.lazy(
  () => import('../pages/admin/invoices'),
);
const InvoiceViewPage = React.lazy(
  () => import('../pages/admin/invoices/view'),
);
const InvoiceReceiptPage = React.lazy(
  () => import('../pages/admin/invoices/receipt'),
);
const SubscriptionExpiredPage = React.lazy(
  () => import('../pages/admin/subscription-expired'),
);
const TrainingCenterPage = React.lazy(
  () => import('../pages/admin/training-center'),
);
const FinancePage = React.lazy(
  () => import('../pages/admin/finance'),
);
const ExpensesPage = React.lazy(
  () => import('../pages/admin/expenses'),
);
const ExpenseViewPage = React.lazy(
  () => import('../pages/admin/expenses/view'),
);
const TrainingVideoViewPage = React.lazy(
  () => import('../pages/admin/training-center/view'),
);
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
        <Route path="/impersonate" element={<ImpersonateHandler />} />
        <Route
          path={ROUTES.FORGOT_PASSWORD}
          element={
            <PublicRoute>
              <ForgotPassword />
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
          path={ROUTES.CHANGE_PASSWORD}
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
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
          element={<Navigate to={ROUTES.MANAGE_JOBS} replace />}
        />
        <Route
          path={ROUTES.MANAGE_JOBS}
          element={
            <ProtectedRoute>
              <ManageJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SCHEDULED_JOBS}
          element={
            <ProtectedRoute>
              <ScheduledJobsPage />
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
          path={ROUTES.JOBS_VIEW_MANAGE}
          element={
            <ProtectedRoute>
              <JobManageViewPage />
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
          path={ROUTES.INVOICES_RECEIPT}
          element={
            <ProtectedRoute>
              <InvoiceReceiptPage />
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
        <Route
          path={ROUTES.SUBSCRIPTION_EXPIRED}
          element={
            <ProtectedRoute>
              <SubscriptionExpiredPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.FINANCE}
          element={
            <ProtectedRoute>
              <FinancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EXPENSES}
          element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EXPENSES_VIEW}
          element={
            <ProtectedRoute>
              <ExpenseViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.TRAINING_CENTER}
          element={
            <ProtectedRoute>
              <TrainingCenterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.TRAINING_CENTER_VIEW}
          element={
            <ProtectedRoute>
              <TrainingVideoViewPage />
            </ProtectedRoute>
          }
        />

        {/* Root and Catch-all */}
        <Route
          path="/"
          element={<Navigate to={ROUTES.DASHBOARD} replace />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
