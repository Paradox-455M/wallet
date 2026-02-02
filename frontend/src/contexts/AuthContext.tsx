import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import axios from 'axios';
import type { AuthUser } from '../types/auth';

type AuthContextValue = {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, fullName: string) => Promise<AuthUser>;
  logout: () => void;
  handleOAuthLogin: (provider: 'google' | 'github') => void;
  handleOAuthCallback: (token: string) => Promise<void>;
  clearError: () => void;
  fetchCurrentUser: (token?: string | null) => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_API_PATH = '/api/auth';

/**
 * Accesses the current authentication context for the calling component.
 *
 * @returns The current AuthContextValue containing authentication state and actions.
 * @throws Error if there is no surrounding AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * Provides authentication state and actions to descendant components.
 *
 * Manages current user, loading, authentication status, and error state; persists and reads the auth token from localStorage; exposes methods for login, registration, logout, OAuth initiation and callback handling, error clearing, and fetching the current user.
 *
 * @returns A React provider element that supplies authentication state and actions to its children.
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchCurrentUser = useCallback(async (token?: string | null) => {
    if (!token) {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return null;
    }
    try {
      const response = await axios.get<{ user: AuthUser }>(`${AUTH_API_PATH}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
      return response.data.user;
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch user data.';
      console.error('Failed to fetch current user:', err);
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsAuthenticated(false);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const handleStorage = () => {
      const newToken = localStorage.getItem('token');
      if (newToken !== token) {
        fetchCurrentUser(newToken);
      }
    };

    window.addEventListener('storage', handleStorage);

    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }

    return () => window.removeEventListener('storage', handleStorage);
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    clearError();
    try {
      const response = await axios.post<{ token: string; user: AuthUser }>(
        `${AUTH_API_PATH}/login`,
        { email, password }
      );
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setLoading(false);
      return user;
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to login. Please check your credentials.';
      console.error('Login failed:', err);
      setError(message);
      setLoading(false);
      throw err;
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    clearError();
    try {
      const response = await axios.post<{ token: string; user: AuthUser }>(
        `${AUTH_API_PATH}/register`,
        { email, password, fullName }
      );
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setLoading(false);
      return user;
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to register. Please try again.';
      console.error('Registration failed:', err);
      setError(message);
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    window.location.href = `${AUTH_API_PATH}/${provider}`;
  };

  const handleOAuthCallback = useCallback(
    async (token: string) => {
      if (token) {
        localStorage.setItem('token', token);
        await fetchCurrentUser(token);
      } else {
        setError('OAuth login failed. No token received.');
        setLoading(false);
      }
    },
    [fetchCurrentUser]
  );

  const value: AuthContextValue = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    handleOAuthLogin,
    handleOAuthCallback,
    clearError,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}