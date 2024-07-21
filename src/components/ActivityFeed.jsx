import React, { useEffect, useState } from 'react'

const ActivityFeed = () => {
    const [error, setError] = useState('');
    const [activities, setActivities] = useState([]);
    const [room, setRoom] = useState([]);

    const getActivities = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No token found');
          return;
        }
    
        try {
          const response = await fetch('http://localhost:5000/api/get/activity-feed', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
    
          const data = await response.json();
    
          if (!response.ok) {
            setError(data.message || 'Failed to fetch topics');
            return;
          }
    
          console.log('data', data);
          setActivities(data);
          setRoom('')
        } catch (error) {
          setError('An error occurred while fetching topics');
          console.error('Error fetching topics:', error);
        }
      };
    
      useEffect(() => {
        getActivities();
      }, []);

  return (
    <div className=''>
      <div className='bg-elements border border-0 rounded-3'>
          <div className='heading d-flex justify-content-between px-4 pt-2'>
            PARTICIPANTS <small>({room?.participants?.length} Joined)</small>
          </div>

          <div className='px-4 py-3'>
            {room?.participants?.map(user => (
              <div key={user?._id} className="d-flex">
                <img className="rounded-circle me-2 mb-2" src="sss" alt="pic" />
                <small className='dim'>@{user?.username}</small>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}

export default ActivityFeed