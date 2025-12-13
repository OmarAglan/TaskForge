import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loading } from './components/common/Loading';
import { PrivateRoute, PublicRoute } from './components/common/PrivateRoute';
import { AppLayout } from './components/layout/AppLayout';
import { useAuthStore } from './store/authStore';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Placeholder pages for Phase 7
const TeamsPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <div style={{ padding: '24px' }}>
        <h1>Teams</h1>
        <p>Teams page will be implemented in Phase 7.</p>
      </div>
    ),
  })
);

const TasksPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <div style={{ padding: '24px' }}>
        <h1>Tasks</h1>
        <p>Tasks page will be implemented in Phase 7.</p>
      </div>
    ),
  })
);

// Placeholder page for Phase 9
const AnalyticsPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <div style={{ padding: '24px' }}>
        <h1>Analytics</h1>
        <p>Analytics page will be implemented in Phase 9.</p>
      </div>
    ),
  })
);

// Placeholder pages for settings and profile
const ProfilePage = lazy(() =>
  Promise.resolve({
    default: () => (
      <div style={{ padding: '24px' }}>
        <h1>Profile</h1>
        <p>Profile page coming soon.</p>
      </div>
    ),
  })
);

const SettingsPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <div style={{ padding: '24px' }}>
        <h1>Settings</h1>
        <p>Settings page coming soon.</p>
      </div>
    ),
  })
);

/**
 * Auth initializer component
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return <Loading fullScreen text="Loading..." />;
  }

  return <>{children}</>;
};

/**
 * Main App component
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AuthInitializer>
              <Suspense fallback={<Loading fullScreen text="Loading page..." />}>
                <Routes>
                  {/* Public Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    }
                  />

                  {/* Protected Routes with Layout */}
                  <Route
                    element={
                      <PrivateRoute>
                        <AppLayout />
                      </PrivateRoute>
                    }
                  >
                    {/* Dashboard */}
                    <Route path="/" element={<DashboardPage />} />

                    {/* Teams - Phase 7 */}
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/teams/:id" element={<TeamsPage />} />
                    <Route path="/teams/new" element={<TeamsPage />} />

                    {/* Tasks - Phase 7 */}
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/tasks/:id" element={<TasksPage />} />
                    <Route path="/tasks/new" element={<TasksPage />} />

                    {/* Analytics - Phase 9 */}
                    <Route path="/analytics" element={<AnalyticsPage />} />

                    {/* Profile & Settings */}
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>

                  {/* Redirects */}
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />

                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </AuthInitializer>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;