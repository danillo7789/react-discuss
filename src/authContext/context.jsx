import React, { createContext, useContext, useEffect, useState } from 'react';
import { decodeToken } from '../utils/decodeToken'; 
import { baseUrl } from '../config/BaseUrl';
import { useCookies } from 'react-cookie';
import api from '../config/axiosConfig';

// Create the context
const AuthContext = createContext(undefined);

// Define the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [token, setToken] = useState('');
  const [cookies, setCookie, removeCookie] = useCookies(['token', 'jwt']);

  const refreshToken = async () => {
    const refreshToken = cookies?.jwt;
    if (refreshToken) {
      try {
        const response = await api.get('/api/user/refresh', {
          headers: { 'Authorization': `Bearer ${refreshToken}` },
        });
        const { token: newToken } = response.data;
        setToken(newToken);
        setCookie('token', newToken, { path: '/', maxAge: 600 });
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return newToken;
      } catch (error) {
        console.error('Error refreshing token:', error);
        logout(); // Optionally logout if refresh fails
        throw error;
      }
    } else {
      throw new Error('No refresh token available');
    }
  };

  const fetchTokenFromCookies = async () => {
    try {
      const storedToken = cookies.token;
      if (storedToken) {
        const decoded = decodeToken(storedToken);
        if (decoded) {
          setCurrentUser(decoded.user);
          setIsLoggedIn(true);
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } else {
        await refreshToken();
      }
    } catch (error) {
      console.error('Error fetching token from cookies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenFromCookies();
  }, []);

  const login = (token) => {
    const decoded = decodeToken(token);
    if (decoded) {
      setCurrentUser(decoded.user);
      setIsLoggedIn(true);
      setToken(token);
      setCookie('token', token, { path: '/', maxAge: 60 });
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/user/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setCurrentUser(null);
        setIsLoggedIn(false);
        removeCookie('token', { path: '/' });
        removeCookie('jwt', { path: '/' });
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoggedIn,
      isLoading,
      login,
      logout,
      searchQuery,
      setSearchQuery,
      topicFilter,
      setTopicFilter,
      setCurrentUser,
      setIsLoggedIn,
      setCookie,
      refreshToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
