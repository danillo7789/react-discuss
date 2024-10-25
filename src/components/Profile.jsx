import { useEffect, useState } from 'react';
import { useAuth } from '../authContext/context';
import { baseUrl } from '../config/BaseUrl';
import Navbar from './Navbar';
import RoomFeed from './RoomFeed';
import ActivityFeed from './ActivityFeed';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../App.css';

const Profile = () => {
  const [user, setUser] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, isLoggedIn, fetchWithTokenRefresh } = useAuth();
  const { id } = useParams();
  const blank_img = import.meta.env.VITE_BLANK_IMG;
  const navigate = useNavigate();

  const getUser = async (id) => {
    setIsLoading(true);

    try {
      const response = await fetchWithTokenRefresh(
        `${baseUrl}/api/get/user/${id}`,
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.message == 'Token expired, please login') {
          logout();
          navigate('/login');
        }
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
      getUser(id);
    }
  }, [isLoggedIn, id]);

  const filterRoomsByHost = (room) => room?.host?._id === id;

  const filterActivitiesByHost = (activity) => activity?.room?.host?._id === id;

  return (
    <div>
      <Navbar />

      <div className='container full-height'>
        <div id='temp-col-contain' className='row pt-3 full-height'>
          {error && (
            <div
              className='alert alert-danger text-danger alert-dismissible fade show'
              role='alert'
            >
              {error}
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='alert'
                aria-label='Close'
              ></button>
            </div>
          )}

          {isLoading ? (
            <div className='container-fluid full-height d-flex justify-content-center align-items-center'>
              <div className='text-center'>
                <div
                  className='spinner-border'
                  style={{ width: '3rem', height: '3rem' }}
                  role='status'
                >
                  <span className='visually-hidden'>Loading...</span>
                </div>
              </div>
            </div>
          ) : (
            <div id='topicfeedp' className='col-lg-3 sticky-col'>
              {error && (
                <div
                  className='alert alert-danger text-danger alert-dismissible fade show'
                  role='alert'
                >
                  {error}
                  <button
                    type='button'
                    className='btn-close'
                    data-bs-dismiss='alert'
                    aria-label='Close'
                  ></button>
                </div>
              )}
              <div>
                <div className='d-flex justify-content-center'>
                  <img
                    className='profile-pic rounded-circle mb-4'
                    src={user?.profilePicture?.url || blank_img}
                    alt='display picture'
                  />
                </div>
                <div className='d-flex justify-content-between'>
                  <div>
                    <div className='mb-4'>
                      <h6>Username: </h6>{' '}
                      <div className='text-light'>{user?.username}</div>
                    </div>
                    <div>
                      <h6>Email: </h6>
                      <div className='text-light'>
                        {currentUser?.id === id
                          ? user?.email
                          : '*********@mail.com'}
                      </div>
                    </div>
                  </div>
                  <div>
                    {currentUser?.id === id && (
                      <Link
                        to={`/update-profile/${user?._id}`}
                        className='linkc btn btns'
                      >
                        Edit Profile
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div id='roomfeedp' className='col-lg-6 overflow'>
            <RoomFeed filterFunction={filterRoomsByHost} />
          </div>

          <div id='activityfeedp' className='col-lg-3 overflow'>
            <ActivityFeed filterFunc={filterActivitiesByHost} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
