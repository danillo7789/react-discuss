import { useEffect, useState } from 'react';
import { useAuth } from '../authContext/context';
import { baseUrl } from '../config/BaseUrl';
import Navbar from './Navbar';
import RoomFeed from './RoomFeed';
import ActivityFeed from './ActivityFeed';
import { Link } from 'react-router-dom';

const Profile = () => {
  const token = localStorage.getItem('token');
  const [user, setUser] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, isLoggedIn } = useAuth();
  const id = currentUser?.id;
  const blank_img = import.meta.env.VITE_BLANK_IMG;

  const getUser = async () => {
    setIsLoading(true);

    if (!token) {
      setError('Token not found');
      return;
    }

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
        setError(data.message || 'Error fetching user');
        setIsLoading(false);
        return;
      }

      setUser(data);
      setIsLoading(false);
    } catch (error) {
      console.error('An error occurred while fetching user:', error);
      setError('An error occurred while fetching user');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      getUser();
    }
  }, [isLoggedIn]);


  const filterRoomsByHost = (room) => room?.host?._id === currentUser?.id;
  const filterActivitiesByHost = (activity) => activity?.room?.host?._id === currentUser?.id;

  return (
    <div>
      <Navbar />

      <div className="container full-height">
        <div className="row pt-3 full-height">
            {error && 
            <div className="alert alert-danger text-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>}

            {isLoading ? <div>Loading...</div> : 
            (<div className="col-lg-3 sticky-col">
                {error && (
                <div className="alert alert-danger text-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
                )}
                <div>
                    <img className="profile-pic rounded-circle mb-4" src={user?.profilePicture?.url || blank_img} alt="display picture" />
                    <div className='d-flex justify-content-between'>
                        <div>
                            <div className='mb-4'><h6>Username: </h6> <div className='text-light'>{user?.username}</div></div>
                            <div><h6>Email: </h6> <div className='text-light'>{user?.email}</div></div>
                        </div>
                        <div>
                            <Link to={`/update-profile/${user?._id}`} className='linkc btn btns'>Edit Profile</Link>
                        </div>
                    </div>
                </div>
            </div>)}

          <div className="col-lg-6 overflow">
            <RoomFeed filterFunction={filterRoomsByHost} />
          </div>

          <div className="col-lg-3 overflow">
            <ActivityFeed filterFunc={filterActivitiesByHost} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
