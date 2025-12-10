import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { LoginDto, RegisterDto } from '../types/auth.types';

/**
 * Custom hook for authentication functionality
 */
export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    clearError,
  } = useAuthStore();

  const login = useCallback(
    async (data: LoginDto, redirectTo: string = '/') => {
      try {
        await storeLogin(data);
        navigate(redirectTo);
      } catch (err) {
        // Error is already set in the store
        throw err;
      }
    },
    [storeLogin, navigate]
  );

  const register = useCallback(
    async (data: RegisterDto, redirectTo: string = '/') => {
      try {
        await storeRegister(data);
        navigate(redirectTo);
      } catch (err) {
        // Error is already set in the store
        throw err;
      }
    },
    [storeRegister, navigate]
  );

  const logout = useCallback(async () => {
    await storeLogout();
    navigate('/login');
  }, [storeLogout, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    logout,
    clearError,
  };
}

export default useAuth;