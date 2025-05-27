import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios, { AxiosResponse } from 'axios';

// Define types
interface User {
  _id: string;
  name: string;
  username: string;
  email?: string;
  role: 'admin' | 'lender' | 'borrower' | 'referrer';
  phone?: string;
  dob?: string;
  address?: string;
  profilePicture?: string;
  status?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  login: (username: string, password: string, role: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string, role: string) => Promise<void>;
  adminRegister: (userData: any) => Promise<AxiosResponse<any, any> | undefined>;
  logout: () => Promise<void>;
  clearError: () => void;
  getFullImageUrl: (path: string | undefined) => string | null;
  fixBorrowerAccount: (username: string, password: string) => Promise<any>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:5001/api/v1';
axios.defaults.withCredentials = true;

// API base URL without the api/v1 path
const apiBaseUrl = 'http://localhost:5001';

// Function to get full image URL
const getFullImageUrl = (path: string | undefined): string | null => {
  if (!path) return null;
  
  // If path already starts with http, return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // If path is for a profile image, use the direct image endpoint for reliable serving
  if (path.startsWith('/uploads/profiles/')) {
    const filename = path.split('/').pop();
    // Use the direct file access endpoint we created
    const directUrl = `${apiBaseUrl}/uploads/profiles/${filename}`;
    return directUrl;
  }
  
  // If path starts with / (relative path), append to base URL
  if (path.startsWith('/')) {
    const fullUrl = `${apiBaseUrl}${path}`;
    return fullUrl;
  }
  
  // Otherwise, assume it's a relative path to the API base
  const fullUrl = `${apiBaseUrl}/${path}`;
  return fullUrl;
};

// Create provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Process user data to ensure profile picture has full URL if needed
  const processUserData = (userData: User): User => {
    if (userData && userData.profilePicture) {
      // Don't modify the original user object
      return userData;
    }
    return userData;
  };

  // Wrapper for setUser that processes the user data
  const setProcessedUser = (userData: User | null) => {
    if (userData) {
      const processedUser = processUserData(userData);
      setUser(processedUser);
    } else {
      setUser(null);
    }
  };

  // Load user on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Add timestamp to prevent caching
        const res = await axios.get(`/auth/me?timestamp=${new Date().getTime()}`);
        
        // Process user data to ensure profile picture has full URL
        const userData = res.data.user;
        setProcessedUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.log('Not authenticated');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (name: string, username: string, email: string, password: string, role: string) => {
    try {
      setLoading(true);
      const res = await axios.post('/auth/register', { name, username, email, password, role });
      setProcessedUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Admin register - creates a user without changing the current logged in user
  const adminRegister = async (userData: any) => {
    try {
      setLoading(true);
      // Add admin_register=true query parameter to let the backend know not to set cookie
      const response = await axios.post('/auth/register?admin_register=true', userData);
      setError(null);
      return response; // Return the response so components can use the data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (username: string, password: string, role: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // First completely reset state
      setUser(null);
      setIsAuthenticated(false);
      
      // Fully logout first to clear any existing session
      try {
        await axios.get('/auth/logout');
      } catch (err) {
        console.log('Logout before login failed, continuing anyway');
      }
      
      // Add a small delay to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Trim whitespace from username to avoid login issues
      const trimmedUsername = username.trim();
      
      console.log(`Attempting login for username: ${trimmedUsername}, role: ${role}`);
      
      // Now attempt the login with role explicitly specified in URL parameter
      try {
        const res = await axios.post(`/auth/login?requested_role=${role}`, { 
          username: trimmedUsername, 
          password 
        });
        
        // Verify role matches what the user selected
        if (res.data.user.role !== role) {
          console.error(`Role mismatch: requested ${role}, got ${res.data.user.role}`);
          setError(`You do not have ${role} permissions. Please login with the correct account type.`);
          
          // Complete reset
          setUser(null);
          setIsAuthenticated(false);
          
          // Clear cookie again
          try {
            await axios.get('/auth/logout');
          } catch (e) {
            console.log('Failed to logout after role mismatch');
          }
          
          return;
        }
        
        // Role matches, set user data and authenticate
        console.log(`Login successful for ${res.data.user.role} role`);
        setProcessedUser(res.data.user);
        setIsAuthenticated(true);
        setError(null);
      } catch (error: any) {
        console.error('API request error:', error);
        console.error('Error response:', error.response?.data);
        
        // Set a more specific error message if available
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.message) {
          setError(error.message);
        } else {
          setError('Login failed. Please try again.');
        }
        
        // Ensure we reset authentication state
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      setIsAuthenticated(false);
      
      // Clear state on error
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      // First clear state to ensure UI updates immediately
      setUser(null);
      setIsAuthenticated(false);
      
      // Then clear the cookie on the server
      await axios.get('/auth/logout');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        setUser: setProcessedUser,
        setIsAuthenticated,
        login,
        register,
        adminRegister,
        logout,
        clearError,
        getFullImageUrl,
        // Helper function to fix borrower account issues
        fixBorrowerAccount: async (username: string, password: string) => {
          try {
            console.log(`Attempting to fix borrower account: ${username}`);
            const response = await axios.get(`/auth/check-borrower/${username}?password=${password}`);
            console.log('Fix borrower response:', response.data);
            return response.data;
          } catch (error) {
            console.error('Error fixing borrower account:', error);
            throw error;
          }
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 