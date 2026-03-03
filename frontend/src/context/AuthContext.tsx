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
import { useUserDirectoryStore } from '@stores/userDirectory.store';
import { useDirectMessagesStore } from '@stores/directMessages.store';
import { useFriendRequestsStore } from '@stores/friendRequests.store';
import { useFriendsStore } from '@stores/Friends.store';

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
  // Start loading if there might be a session, so ProtectedRoute doesn't redirect prematurely
  const [isLoading, setIsLoading] = useState(
    () =>
      !!localStorage.getItem('has_session') ||
      new URLSearchParams(window.location.search).get('oauth') === 'success'
  );

  const checkAuth = async () => {
    // Detect OAuth return via query parameter
    const params = new URLSearchParams(window.location.search);
    const isOAuthReturn = params.get('oauth') === 'success';

    // Set session flag immediately so StrictMode double-invoke still works
    if (isOAuthReturn) {
      localStorage.setItem('has_session', 'true');
      params.delete('oauth');
      const cleanUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', cleanUrl);
    }

    // Skip the API call entirely if no session exists (avoids browser 401 log)
    if (!localStorage.getItem('has_session')) {
      setUser(null);
      return;
    }

    setIsLoading(true);

    try {
      const response = await userAPI.getMe({ _skipAuthRefresh: true });
      setUser(response.data.user);
      localStorage.setItem('has_session', 'true');
    } catch {
      setUser(null);
      localStorage.removeItem('has_session');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Remove session flag immediately to prevent any further API calls
    localStorage.removeItem('has_session');
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      destroyManager();
      // Clear all Zustand stores so components don't use stale data
      useUserDirectoryStore.getState().reset();
      useDirectMessagesStore.getState().reset();
      useFriendRequestsStore.getState().reset();
      useFriendsStore.getState().reset();
      localStorage.setItem('auth_sync', Date.now().toString());
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for axios interceptor logout events
    const handleLogoutTrace = () => {
      setUser(null);
      localStorage.removeItem('has_session');
      destroyManager();
      useUserDirectoryStore.getState().reset();
      useDirectMessagesStore.getState().reset();
      useFriendRequestsStore.getState().reset();
      useFriendsStore.getState().reset();
      localStorage.setItem('auth_sync', Date.now().toString());
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
