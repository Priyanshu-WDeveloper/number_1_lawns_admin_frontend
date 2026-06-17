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
const EmployeeWalletPage = React.lazy(
  () => import('../pages/admin/employees/wallet'),
);
const NotFoundPage = React.lazy(() => import('../pages/not-found'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
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

        <Route element={<ProtectedRoute />}>
          <Route
            path={ROUTES.DASHBOARD}
            element={<DashboardPage />}
          />
          <Route
            path={ROUTES.PROFILE}
            element={<AdminProfilePage />}
          />
          <Route
            path={ROUTES.CHANGE_PASSWORD}
            element={<ChangePasswordPage />}
          />
          <Route
            path={ROUTES.CUSTOMERS}
            element={<CustomerManagementPage />}
          />
          <Route
            path={ROUTES.CUSTOMERS_CREATE}
            element={<CreateCustomerPage />}
          />
          <Route
            path={ROUTES.CUSTOMERS_VIEW}
            element={<CustomerViewPage />}
          />
          <Route
            path={ROUTES.CUSTOMERS_EDIT}
            element={<CustomerEditPage />}
          />
          <Route
            path={ROUTES.EMPLOYEES}
            element={<EmployeeManagementPage />}
          />
          <Route
            path={ROUTES.EMPLOYEES_CREATE}
            element={<CreateEmployeePage />}
          />
          <Route
            path={ROUTES.EMPLOYEES_VIEW}
            element={<EmployeeViewPage />}
          />
          <Route
            path={ROUTES.EMPLOYEES_EDIT}
            element={<EmployeeEditPage />}
          />
          <Route
            path={ROUTES.EMPLOYEES_WALLET}
            element={<EmployeeWalletPage />}
          />
          <Route
            path={ROUTES.JOBS}
            element={<Navigate to={ROUTES.MANAGE_JOBS} replace />}
          />
          <Route
            path={ROUTES.MANAGE_JOBS}
            element={<ManageJobsPage />}
          />
          <Route
            path={ROUTES.SCHEDULED_JOBS}
            element={<ScheduledJobsPage />}
          />
          <Route
            path={ROUTES.JOBS_CREATE}
            element={<CreateJobPage />}
          />
          <Route
            path={ROUTES.JOBS_VIEW}
            element={<JobViewPage />}
          />
          <Route
            path={ROUTES.JOBS_VIEW_MANAGE}
            element={<JobManageViewPage />}
          />
          <Route
            path={ROUTES.JOBS_EDIT}
            element={<JobEditPage />}
          />
          <Route
            path={ROUTES.INVOICES}
            element={<InvoiceManagementPage />}
          />
          <Route
            path={ROUTES.INVOICES_VIEW}
            element={<InvoiceViewPage />}
          />
          <Route
            path={ROUTES.INVOICES_RECEIPT}
            element={<InvoiceReceiptPage />}
          />
          <Route
            path={ROUTES.NOTIFICATIONS}
            element={<NotificationsPage />}
          />
          <Route
            path={ROUTES.SUBSCRIPTION_EXPIRED}
            element={<SubscriptionExpiredPage />}
          />
          <Route
            path={ROUTES.FINANCE}
            element={<FinancePage />}
          />
          <Route
            path={ROUTES.EXPENSES}
            element={<ExpensesPage />}
          />
          <Route
            path={ROUTES.EXPENSES_VIEW}
            element={<ExpenseViewPage />}
          />
          <Route
            path={ROUTES.TRAINING_CENTER}
            element={<TrainingCenterPage />}
          />
          <Route
            path={ROUTES.TRAINING_CENTER_VIEW}
            element={<TrainingVideoViewPage />}
          />
        </Route>

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
