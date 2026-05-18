import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROLES, ROUTES } from '@/constants';
import { getUserRole, isAuthenticated } from '../lib/auth';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const authenticated = isAuthenticated();

  const role = getUserRole();

  if (authenticated) {
    if (role === ROLES.SUPER_ADMIN) {
      return <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />;
    }

    if (role === ROLES.ADMIN) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  return <>{children}</>;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authenticated = isAuthenticated();

  const role = getUserRole();

  if (!authenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (role !== ROLES.ADMIN) {
    return <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />;
  }

  return <>{children}</>;
}
interface SuperAdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const authenticated = isAuthenticated();

  const role = getUserRole();

  if (!authenticated) {
    return <Navigate to={ROUTES.SUPER_ADMIN_LOGIN} replace />;
  }

  if (role !== ROLES.SUPER_ADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
