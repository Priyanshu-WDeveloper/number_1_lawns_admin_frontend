import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROLES, ROUTES } from '@/constants';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { useGetAdminDetailsQuery } from '@/API/api';
import { setAuth } from '@/store/auth-slice';
import Loader from '@/components/loader';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;

  if (token) {
    if (role === ROLES.SUPER_ADMIN) {
      return <Navigate to={ROUTES.SUPER_ADMIN_LOGIN} replace />;
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
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;
  const dispatch = useDispatch();
  const location = useLocation();

  const {
    data: adminDetails,
    isLoading,
    isUninitialized,
  } = useGetAdminDetailsQuery(undefined, {
    skip: !token || role !== ROLES.ADMIN,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (adminDetails?.admin && token && role === ROLES.ADMIN) {
      const admin = adminDetails.admin;
      dispatch(
        setAuth({
          user: {
            fullName: admin.fullName,
            email: admin.email,
            role: admin.role,
            validity: admin.validity as unknown as Date,
          },
          token,
        }),
      );
    }
  }, [adminDetails, token, role, dispatch]);

  const validity = adminDetails?.admin?.validity ?? user?.validity;
  const daysLeft = useMemo(() => {
    if (!validity) return null;
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    return Math.ceil(
      (new Date(validity).getTime() - now) / (1000 * 60 * 60 * 24),
    );
  }, [validity]);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (role !== ROLES.ADMIN) {
    return <Navigate to={ROUTES.SUPER_ADMIN_LOGIN} replace />;
  }

  if (isLoading || isUninitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        {/* <div className="text-muted-foreground">Loading...</div> */}
        <Loader />
      </div>
    );
  }

  const isExpired = daysLeft === null || daysLeft <= 0;

  const allowedPaths = [
    ROUTES.SUBSCRIPTION_EXPIRED,
    ROUTES.PROFILE,
    ROUTES.CHANGE_PASSWORD,
  ];

  if (
    isExpired &&
    !allowedPaths.includes(
      location.pathname as (typeof allowedPaths)[number],
    )
  ) {
    return <Navigate to={ROUTES.SUBSCRIPTION_EXPIRED} replace />;
  }

  if (
    !isExpired &&
    location.pathname === ROUTES.SUBSCRIPTION_EXPIRED
  ) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
