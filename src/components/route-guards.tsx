import React from 'react';
// import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({
  children,
  redirectTo = ROUTES.DASHBOARD,
}: PublicRouteProps) {
  // const isAuthenticated = true;
  // if (isAuthenticated) {
  //   return <Navigate to={redirectTo} replace />;
  // }
  void redirectTo;
  return <>{children}</>;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = ROUTES.LOGIN,
}: ProtectedRouteProps) {
  // const isAuthenticated = true;
  // if (!isAuthenticated) {
  //   return <Navigate to={redirectTo} replace />;
  // }
  void redirectTo;
  return <>{children}</>;
}

interface SuperAdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function SuperAdminRoute({
  children,
  redirectTo = ROUTES.SUPER_ADMIN_LOGIN,
}: SuperAdminRouteProps) {
  // const isAuthenticated = true;
  // if (!isAuthenticated) {
  //   return <Navigate to={redirectTo} replace />;
  // }
  void redirectTo;
  return <>{children}</>;
}
