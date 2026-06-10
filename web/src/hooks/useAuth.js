import { useContext, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { login as apiLogin, register as apiRegister } from '../api/auth.api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, loginUser, logoutUser, loading } = context;
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await apiLogin({ email, password });
      loginUser(res.data);
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid email or password';
      setAuthError(errMsg);
      throw new Error(errMsg);
    } finally {
      setAuthLoading(false);
    }
  }, [loginUser]);

  const register = useCallback(async (fullName, email, password, role) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await apiRegister({ fullName, email, password, role });
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed';
      setAuthError(errMsg);
      throw new Error(errMsg);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    authLoading,
    authError,
    login,
    register,
    logout: logoutUser,
  };
};

export default useAuth;
