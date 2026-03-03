import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { userAPI, MyProfileRes } from '../api/user.api';
import { authAPI } from '../api/auth.api';
import { destroyManager } from '@services/manager';

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
  const [isLoading, setIsLoading] = useState(false);

  const checkAuth = async () => {
    setIsLoading(true);

    try {
      const response = await userAPI.getMe();
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
      destroyManager();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      destroyManager();
      localStorage.setItem('auth_sync', Date.now().toString());
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for axios interceptor logout events
    const handleLogoutTrace = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogoutTrace);

    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key === 'auth_sync') {
        checkAuth();
      }
    };

    window.addEventListener('storage', syncAcrossTabs);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutTrace);
      window.removeEventListener('storage', syncAcrossTabs);
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
