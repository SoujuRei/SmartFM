import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { type UserRole } from '../../constants/enums';
import { FullPageSpinner } from '../ui/Spinner';

interface ProtectedRouteProps {
  roles?: UserRole[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { loggedInUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (!loggedInUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(loggedInUser.role as UserRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
