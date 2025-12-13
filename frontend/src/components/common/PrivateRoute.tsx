import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Loading } from './Loading';

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Protected route wrapper component
 * Redirects to login if user is not authenticated
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();

  // Show loading while checking authentication
  if (!isInitialized || isLoading) {
    return <Loading fullScreen text="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

/**
 * Public route wrapper component
 * Redirects to dashboard if user is already authenticated
 */
interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/',
}) => {
  const location = useLocation();
  const { isAuthenticated, isInitialized } = useAuthStore();

  // Show loading while checking authentication
  if (!isInitialized) {
    return <Loading fullScreen text="Loading..." />;
  }

  // Redirect to home/dashboard if already authenticated
  if (isAuthenticated) {
    // Check if there's a saved location to redirect to
    const from = (location.state as { from?: Location })?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  // Render public content
  return <>{children}</>;
};

export default PrivateRoute;