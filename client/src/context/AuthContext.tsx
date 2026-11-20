import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, AuthResponse } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, avatar?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cinepulse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('cinepulse_token');
  });
  const [loading, setLoading] = useState(true);

  // Set default auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('cinepulse_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('cinepulse_token');
      localStorage.removeItem('cinepulse_user');
    }
  }, [token]);

  // Validate session on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('cinepulse_token');
      if (storedToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const res = await axios.get<{ user: User }>('/api/auth/me');
          setUser(res.data.user);
          localStorage.setItem('cinepulse_user', JSON.stringify(res.data.user));
        } catch {
          // Token invalid or expired
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post<AuthResponse>('/api/auth/login', { email, password });
    const { user: loggedInUser, token: authToken } = res.data;
    setToken(authToken);
    setUser(loggedInUser);
    localStorage.setItem('cinepulse_user', JSON.stringify(loggedInUser));
  };

  const register = async (name: string, email: string, password: string, avatar?: string) => {
    const res = await axios.post<AuthResponse>('/api/auth/register', { name, email, password, avatar });
    const { user: registeredUser, token: authToken } = res.data;
    setToken(authToken);
    setUser(registeredUser);
    localStorage.setItem('cinepulse_user', JSON.stringify(registeredUser));
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await axios.get<{ user: User }>('/api/auth/me');
        setUser(res.data.user);
        localStorage.setItem('cinepulse_user', JSON.stringify(res.data.user));
      } catch {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
