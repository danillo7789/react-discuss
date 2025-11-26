import { createContext, useContext, useEffect, useState } from 'react';
import { decodeToken } from '../utils/decodeToken'; 
import { baseUrl } from '../config/BaseUrl';
import { io } from "socket.io-client";

// Create the context
const AuthContext = createContext(undefined);

// Define the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('');  
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const fetchWithTokenRefresh = async (url, options = {}) => {
    try {
      const headers = { ...options.headers };
  
      // Check if the body is FormData and remove the 'Content-Type' header if it is
      if (options.body instanceof FormData) {
        delete headers['Content-Type'];
      } else {
        headers['Content-Type'] = 'application/json';
      }
  
      let response = await fetch(url, {
        ...options,
        headers: {
          ...headers,          
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
          // Retry the original request with the new token
          response = await fetch(url, {
            ...options,
            headers: {
              ...headers,
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
      const response = await fetch(`${baseUrl}/api/user/refresh`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {            
        const decoded = decodeToken(data.token);
        if (decoded) {
          setCurrentUser(decoded.user);
          setIsLoggedIn(true);              
        }
      } else {
        console.error('Error fetching token from cookies:', data.message);
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


  const socket = io(baseUrl, {
    reconnection: true,
    reconnectionAttempts: 5, // Increased attempts
    reconnectionDelay: 2000, // Delay before retrying
    transports: ["websocket"],
  });

  useEffect(() => {
    if (currentUser) {
      socket.emit("userOnline", currentUser.id);

      socket.on("onlineUsers", (users) => {
        setOnlineUsers(new Set([...users])); // Spread into an array
      });

      socket.on("reconnect_attempt", (attempt) => {
        console.log(`Reconnect attempt ${attempt}`);
      });

      socket.on("reconnect", () => {
        console.log("Reconnected successfully!");
        socket.emit("userOnline", currentUser.id);
      });

      return () => {
        if (currentUser) {
          socket.emit("userOffline", currentUser.id);
        }
        socket.disconnect();
      };
    }
  }, [currentUser]);

  const login = (token) => {
    const decoded = decodeToken(token);
    if (decoded) {
      setCurrentUser(decoded.user);
      setIsLoggedIn(true);
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
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const contextValue = {
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
      onlineUsers
    }

  return (
    <AuthContext.Provider value={contextValue}>
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
