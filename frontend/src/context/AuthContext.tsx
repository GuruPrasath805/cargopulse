import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { ApiClient } from '../services/api';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyName?: string;
  phone?: string;
  photoUrl?: string;
  aadharCardUrl?: string;
  experienceYears?: number | string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  /** Logs into a specific portal. Throws with a human-readable message on failure. */
  login: (email: string, password: string, expectedRole: UserRole) => Promise<User>;
  /** Submits a new account for a portal. Account is PENDING until an admin approves it. */
  register: (payload: RegisterPayload) => Promise<{ message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cargopulse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from a previously stored token (no auto-login as a demo user).
  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('cargopulse_user');
      const savedToken = localStorage.getItem('cargopulse_token');
      if (savedUser && savedToken) {
        try {
          // Verify the token is still valid / account hasn't been revoked.
          const me = await ApiClient.get('/auth/me');
          setUser(me.user);
          setToken(savedToken);
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string, expectedRole: UserRole): Promise<User> => {
    const response = await ApiClient.post('/auth/login', { email, password, expectedRole });
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('cargopulse_token', response.token);
    localStorage.setItem('cargopulse_user', JSON.stringify(response.user));
    return response.user;
  };

  const register = async (payload: RegisterPayload): Promise<{ message: string }> => {
    const response = await ApiClient.post('/auth/register', payload);
    return { message: response.message };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cargopulse_token');
    localStorage.removeItem('cargopulse_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
