import { useState, useEffect, useCallback } from 'react';
import { apiPost } from '../services/api';

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { ok, data } = await apiPost('/api/login', { email, password });
      if (ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        return { success: true };
      }
      return { error: data.error || 'Login failed' };
    } catch {
      return { error: 'Failed to connect to server' };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const { ok, data } = await apiPost('/api/register', { name, email, password });
      if (ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        return { success: true };
      }
      return { error: data.error || 'Registration failed' };
    } catch {
      return { error: 'Failed to connect to server' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, []);

  return { isAuthenticated, currentUser, login, register, logout };
}
