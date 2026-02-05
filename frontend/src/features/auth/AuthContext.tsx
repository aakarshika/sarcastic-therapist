import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { authApi, User } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = () => {
    // No explicit token removal needed for cookies on client side logic
    // But we clear state.
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      // Always try to fetch me to see if session is valid
      try {
        const res = await authApi.getMe();
        setUser(res.data);
      } catch (error) {
        // Not authenticated
        clearAuth();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    authApi.logout().finally(() => {
      clearAuth();
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
