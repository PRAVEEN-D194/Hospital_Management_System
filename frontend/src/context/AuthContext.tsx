import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Patient, Doctor, Admin, TokenResponse } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: Patient | Doctor | Admin | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: TokenResponse) => void;
  logout: () => void;
  updateUser: (updated: Patient | Doctor | Admin) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [role, setRole] = useState<UserRole | null>(() => localStorage.getItem('role') as UserRole);
  const [user, setUser] = useState<Patient | Doctor | Admin | null>(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate on load with backend profile
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedRole = localStorage.getItem('role') as UserRole;

      if (!savedToken || !savedRole) {
        setIsLoading(false);
        return;
      }

      try {
        if (savedRole === 'patient') {
          const profile = await authService.getPatientProfile();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } else if (savedRole === 'doctor') {
          const profile = await authService.getDoctorProfile();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } else if (savedRole === 'admin') {
          const profile = await authService.getAdminProfile();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } catch {
        // Token invalid or expired
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (data: TokenResponse) => {
    setToken(data.access_token);
    setRole(data.role);
    setUser(data.user);

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  };

  const updateUser = (updated: Patient | Doctor | Admin) => {
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
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

