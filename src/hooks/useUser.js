import { useState, useEffect } from 'react';
import { useAuth } from '../authContext/context';
import { baseUrl } from '../config/BaseUrl';

const useUser = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const token = localStorage.getItem('token');
  const id = currentUser?.id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/get/user/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to fetch user');
          return;
        }

        setUser(data);
      } catch (error) {
        console.error('An error occurred while fetching user:', error);
        setError('An error occurred while fetching user');
      }
    };

    if (id && token) {
      fetchUser();
    }
  }, [id, token]);

  return { user, error };
};

export default useUser;
