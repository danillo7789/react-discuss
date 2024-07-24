import React, { useEffect, useState } from 'react'
import { baseUrl } from '../config/BaseUrl';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext/context';

const ActivityFeed = ({ filterFunc }) => {
  const [error, setError] = useState('');
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('token');
  const blank_img = import.meta.env.VITE_BLANK_IMG;
  const { searchQuery } = useAuth();
  
  // console.log('activity feed rendered');

  const getAllChats = async () => {
    setError('')
    setIsLoading(true)
    
    if (!token) {
      setError('No token found');
      setIsLoading(false)
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/get/chats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message == 'Token expired, please login') {
          logout();
          navigate('/login')
        } else {
            setIsLoading(false);
            setError(data.message || 'Failed to fetch rooms');
            return;
        }
      }

      setActivities(data);
      setIsLoading(false)
    } catch (error) {
      setError('An error occurred while fetching chats');
      console.error('Error fetching chats:', error);
      setIsLoading(false);
    }
  };
    
  useEffect(() => {
    getAllChats();
  }, []);

  // const filteredActivities = filterFunc ? activities.filter(filterFunc) : activities;

  const filteredActivities = activities
    .filter(activity => filterFunc ? filterFunc(activity) : true)
    .filter(activity => searchQuery ? activity?.room?.name?.toLowerCase().includes(searchQuery?.toLowerCase())
      || activity?.text?.toLowerCase().includes(searchQuery?.toLowerCase()) : true);

  return (
    <div className=''>
        {error && 
        <div className="alert alert-danger text-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        }
      <div className='bg-elements border border-0 rounded-3'>
          <div className='heading d-flex justify-content-between px-4 pt-2'>
            RECENT ACTIVITIES
          </div>
          {isLoading ? (<div>Loading...</div>) : 
          (<div className='px-3 py-3 '>
            {filteredActivities?.map(activity => (
              <div key={activity?._id} className="border border-secondary rounded mb-2">
                <div className='d-flex p-1'>
                  <img className="rounded-circle me-2 display-pic" src={activity?.sender?.profilePicture?.url || blank_img} alt="display picture" />
                  <div>
                    <Link className='linkc' to={`/profile/${activity?.sender?._id}`}><small className='dim me-2 f-sm'>@{activity?.sender?.username}</small></Link>
                    <small className='fw-lighter f-xsm'>{moment(activity?.createdAt).fromNow()}</small>
                    <div>
                      <small className='f-sm'>posted to room</small> 
                      "<div>
                        <Link to={`/room/${activity?.room?._id}`} className='linkc dim'>{activity?.room?.name}</Link>
                      </div>"
                    </div>
                  </div>          
                </div>
                
                <div className='mx-2 f-sm border border-0 activity-chat mb-2 p-2 rounded'>{activity?.text}</div>

              </div>
            ))}
          </div>)}
        </div>
    </div>
  )
}

export default ActivityFeed