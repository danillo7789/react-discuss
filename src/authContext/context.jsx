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
      const headers = { ...options.headers };
  
      // Check if the body is FormData and remove the 'Content-Type' header if it is
      if (options.body instanceof FormData) {
        delete headers['Content-Type'];
      } else {
        headers['Content-Type'] = 'application/json';
      }
  
      console.log('headers', headers);
      let response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });
  
      if (response.status === 401) {
        const refreshResponse = await fetch(`${baseUrl}/api/user/refresh`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
  
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newToken = data.token;
          setToken(newToken);
          setCookie('token', newToken, { path: '/', maxAge: 900 });
  
          // Retry the original request with the new token
          response = await fetch(url, {
            ...options,
            headers: {
              ...headers,
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
        
          const response = await fetch(`${baseUrl}/api/user/refresh`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          const data = await response.json();

          if (response.ok) {
            setCookie('token', data.token, { path: '/', maxAge: 900 });
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
      setCookie('token', token, { path: '/', maxAge: 900 });
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
