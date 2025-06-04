import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Assuming axios is used for API calls

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auth';

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const fetchCurrentUser = useCallback(async (token) => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsAuthenticated(false);
      setError(err.response?.data?.message || 'Failed to fetch user data.');
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

  const navigate = useNavigate();

  // Removed useEffect that redirects to dashboard on authentication

  const login = async (email, password) => {
    setLoading(true);
    clearError();
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setLoading(false);
      return user;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
      setLoading(false);
      throw err; // Re-throw to be caught by the form
    }
  };

  const register = async (email, password, fullName) => {
    setLoading(true);
    clearError();
    try {
      const response = await axios.post(`${API_URL}/register`, { email, password, fullName });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setLoading(false);
      return user;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
      setLoading(false);
      throw err; // Re-throw to be caught by the form
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    // Optionally call backend logout if it does anything (e.g., invalidate refresh tokens)
    // await axios.get(`${API_URL}/logout`);
  };

  const handleOAuthLogin = (provider) => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_URL}/${provider}`;
  };
  
  // This function will be called from the OAuth callback page
  const handleOAuthCallback = useCallback(async (token) => {
    if (token) {
      localStorage.setItem('token', token);
      await fetchCurrentUser(token); // Fetch user details with the new token
    } else {
      setError('OAuth login failed. No token received.');
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  const value = {
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
    fetchCurrentUser // Expose if needed elsewhere, e.g., after token refresh
  };

  return (
    <AuthContext.Provider value={value}>
      {children} 
    </AuthContext.Provider>
  );
}