import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  // return the logged-in user for immediate use after calling
  login: (email: string, password: string, adminOnly?: boolean) => Promise<User>;
  signup: (email: string, password: string) => Promise<User>;
  // allow updating the user object (e.g. after a role change)
  updateUser: (u: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    // On mount, try to rehydrate session from localStorage token
    const storedToken = localStorage.getItem('miniDrive:token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // set token (so api calls can include it) and fetch /me to get user
    (async () => {
      setToken(storedToken);
      try {
        const resp = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (!resp.ok) {
          // invalid token, clear storage
          localStorage.removeItem('miniDrive:token');
          setToken(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
        const data = await resp.json();
        setUser(data.user);
      } catch (err) {
        console.error('Session rehydrate failed', err);
        localStorage.removeItem('miniDrive:token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Listen for global unauthorized events (dispatched by api helper) and logout
  useEffect(() => {
    const handler = () => {
      logout();
    };
    window.addEventListener('miniDrive:unauthorized', handler);
    return () => window.removeEventListener('miniDrive:unauthorized', handler);
  }, []);

  const login = async (email: string, password: string, adminOnly: boolean = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Try to parse JSON error, fallback to text if it fails
        let errorMessage = 'Login failed';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          // If JSON parsing fails, try to get text
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // If adminOnly is requested, ensure the user is admin
      if (adminOnly && data.user?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      setToken(data.token);
      setUser(data.user);
      // persist token so sessions survive refresh
      try {
        localStorage.setItem('miniDrive:token', data.token);
      } catch (e) {
        console.warn('Failed to persist token', e);
      }
      return data.user as User;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Try to parse JSON error, fallback to text if it fails
        let errorMessage = 'Signup failed';
        try {
          const error = await response.json();
          // Handle validation errors array
          if (error.errors && Array.isArray(error.errors)) {
            errorMessage = error.errors.map((e: any) => e.msg).join(', ');
          } else {
            errorMessage = error.message || errorMessage;
          }
        } catch {
          // If JSON parsing fails, try to get text
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      try {
        localStorage.setItem('miniDrive:token', data.token);
      } catch (e) {
        console.warn('Failed to persist token', e);
      }
      return data.user as User;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    // Clearing memory and persisted token
    try {
      localStorage.removeItem('miniDrive:token');
    } catch (e) {
      /* ignore */
    }
  };

  const updateUser = (u: User) => {
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, updateUser, logout, isLoading }}>
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
