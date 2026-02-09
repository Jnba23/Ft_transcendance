import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { userAPI, MyProfileRes } from '../api/user.api';
import { authAPI } from '../api/auth.api';

interface AuthContextType {
  user: MyProfileRes | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MyProfileRes | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await userAPI.getMe();
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      // Optionally redirect here or let the ProtectedRoute handle it
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for axios interceptor logout events
    const handleLogoutTrace = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogoutTrace);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutTrace);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        checkAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
