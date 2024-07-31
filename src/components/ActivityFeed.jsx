import React, { useEffect, useState } from 'react'
import { baseUrl } from '../config/BaseUrl';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext/context';
import BackLink from './BackLink';

const ActivityFeed = ({ filterFunc, visibleActivity, setVisibleActivity, filterActivity }) => {
  const [error, setError] = useState('');
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const blank_img = import.meta.env.VITE_BLANK_IMG;
  const { searchQuery, topicFilter, fetchWithTokenRefresh } = useAuth();
  
  // console.log('activity feed rendered');

  const getAllChats = async () => {
    setError('')
    setIsLoading(true)

    try {
      const response = await fetchWithTokenRefresh(`${baseUrl}/api/get/chats`, {
        method: 'GET',
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
    .filter(activity => filterFunc ? filterFunc(activity) : filterActivity ? filterActivity(activity) : true)
    .filter(activity => searchQuery ? activity?.room?.name?.toLowerCase().includes(searchQuery?.toLowerCase())
      || activity?.text?.toLowerCase().includes(searchQuery?.toLowerCase()) : true)
    .filter(activity => topicFilter ? activity?.room?.topic?.name?.toLowerCase() === topicFilter.toLowerCase() : true);

  return (
    <div>
      {/* <div className='activity-navbar'>
        <Navbar />
      </div> */}
      <div className='activity'>
          {error && 
          <div className="alert alert-danger text-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
          }
        <div className='bg-elements border border-0 rounded-3'>
            <div className='heading d-flex justify-content-between px-4 pt-2'>
              <div className='d-flex'>
                <div className='back-link'>
                  < BackLink visibleActivity={visibleActivity} setVisibleActivity={setVisibleActivity} />
                </div>  
                <div className='ms-5 f-sm'>RECENT ACTIVITIES</div>
              </div>
              <div></div>            
            </div>
            {isLoading ? (
              <div className="container-fluid full-height d-flex justify-content-center align-items-center">
                <div className="text-center">
                    <div className="spinner-border" style={{width: '3rem', height: '3rem'}} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
              </div>
            ) : 
            (<div className='px-3 py-3 '>
              {filteredActivities.length > 0 ? filteredActivities?.map(activity => (
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
              )) : 'No activities to Show'}
            </div>)}
          </div>
      </div>
    </div>

  )
}

export default ActivityFeed