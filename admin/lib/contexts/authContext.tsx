'use client';

import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface UserPermissions {
  name: string;
  scope: string;
}

interface User {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  isAdmin?: boolean;
  permissions?: UserPermissions[];
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  hasPermission: (permissionName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async (): Promise<boolean> => {
    try {
      console.log('Checking auth status...');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`,
        {
          withCredentials: true,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Auth check response:', response.data);

      if (response.status === 200 && response.data?.data) {
        console.log('User authenticated:', response.data.data);
        setUser(response.data.data);
        return true;
      }

      console.log('No user data in response');
      setUser(null);
      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Auth check failed:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          error: error.message,
        });
      } else {
        console.error('Auth check failed with unknown error:', error);
      }

      setUser(null);
      // Only redirect if not already on sign-in page and not loading
      if (!pathname.includes('/sign-in') && !loading) {
        console.log('Redirecting to sign-in page...');
        router.push('/admin/sign-in');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Attempting login...');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/admin/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Login response:', response.data);

      if (response.status === 200 && response.data?.data?.user) {
        console.log('Login successful, user:', response.data.data.user);
        setUser(response.data.data.user);
        router.push('/admin/dashboard');
        return;
      }
      throw new Error('Login failed - Invalid response format');
    } catch (error) {
      console.error('Login error:', {
        error: axios.isAxiosError(error)
          ? {
              status: error.response?.status,
              message: error.response?.data?.message,
              error: error.message,
            }
          : error,
      });

      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? 'Login failed');
      }
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/admin/logout`,
        {},
        {
          withCredentials: true,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      setUser(null);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const hasPermission = (permissionName: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.some(p => p.name === permissionName);
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log('Initializing auth check on path:', pathname);
      await checkAuth();
    };

    initAuth();
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{ user, loading, checkAuth, logout, login, hasPermission }}
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
