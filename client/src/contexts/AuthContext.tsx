import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, LoginResponse, RegisterResponse, ApiError } from '../services/api';

interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response: LoginResponse = await authApi.login(email, password);
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during login');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response: RegisterResponse = await authApi.register(email, password, username);
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
    } catch (err) {
      if (err instanceof ApiError) {
        // Handle validation errors
        if (err.errors && err.errors.length > 0) {
          const errorMessages = err.errors.map(e => e.msg).join(', ');
          setError(errorMessages);
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred during registration');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};