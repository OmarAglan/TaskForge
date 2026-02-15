import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loading } from './components/common/Loading';
import { PrivateRoute, PublicRoute } from './components/common/PrivateRoute';
import { AppLayout } from './components/layout/AppLayout';
import { ToastProvider } from './components/shared/ToastProvider';
import { AuthProvider } from './contexts/AuthContext';
import { useWebSocket } from './hooks/useWebSocket';
import { useAuthStore } from './store/authStore';
import { theme } from './theme';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Teams pages
const TeamsPage = lazy(() => import('./pages/teams/TeamsPage'));
const TeamDetailPage = lazy(() => import('./pages/teams/TeamDetailPage'));

// Tasks pages
const TasksPage = lazy(() => import('./pages/tasks/TasksPage'));
const TaskBoardPage = lazy(() => import('./pages/tasks/TaskBoardPage'));
const TaskDetailPage = lazy(() => import('./pages/tasks/TaskDetailPage'));
const MyTasksPage = lazy(() => import('./pages/tasks/MyTasksPage'));

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
  // Initialize WebSocket connection when user is authenticated
  // The hook will handle connect/disconnect based on auth state
  useWebSocket();

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
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

                      {/* Teams */}
                      <Route path="/teams" element={<TeamsPage />} />
                      <Route path="/teams/:id" element={<TeamDetailPage />} />

                      {/* Tasks */}
                      <Route path="/tasks" element={<TasksPage />} />
                      <Route path="/tasks/board" element={<TaskBoardPage />} />
                      <Route path="/tasks/me" element={<MyTasksPage />} />
                      <Route path="/tasks/:id" element={<TaskDetailPage />} />

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
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;