import React, { createContext, useContext, useEffect, useState } from 'react';
import { decodeToken } from '../utils/decodeToken'; 
import { baseUrl } from '../config/BaseUrl';
import { useCookies } from 'react-cookie';

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

  const fetchWithTokenRefresh = async (url, options = {}) => {
    try {
      let response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        const refreshToken = cookies?.jwt;
        console.log('refreshtoken', refreshToken)

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await fetch(`${baseUrl}/api/user/refresh`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`
          },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          console.log('refreshed token data', data);
          const newToken = data.token;
          setToken(newToken);
          setCookie('token', newToken, { path: '/', maxAge: 60 }); // Update token in cookies

          // Retry the original request with the new token
          response = await fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`,
            },
            credentials: 'include',
          });
        } else {
          throw new Error('Unable to refresh token');
        }
      }

      return response;
    } catch (error) {
      console.error('Error in fetchWithTokenRefresh:', error);
      throw error;
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
        }
      } else {
        // Try to refresh the token if it exists
        const refreshToken = cookies.jwt;
        if (refreshToken) {
          const response = await fetch(`${baseUrl}/api/user/refresh`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`
            },
            credentials: 'include',
          });

          const data = await response.json();
          if (response.ok) {
            setCookie('token', data.token, { path: '/', maxAge: 60 }); // Set new token in cookies
            const decoded = decodeToken(data.token);
            if (decoded) {
              setCurrentUser(decoded.user);
              setIsLoggedIn(true);
              setToken(data.token);
            }
          } else {
            console.error('Error fetching token from cookies:', data.message);
          }
        }
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
      setCurrentUser, // Exposing these to allow setting in login
      setIsLoggedIn,
      fetchWithTokenRefresh,
      setCookie,
      cookies
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
