import { useState, useEffect } from 'react';
import { baseUrl } from '../config/BaseUrl';
import { useAuth } from '../authContext/context';
import Navbar from './Navbar';
import BackLink from './BackLink';
import { useNavigate, useParams } from 'react-router-dom';
import useUser from '../hooks/useUser';

const EditProfile = () => {
  const { user } = useUser();  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState('');
  const { currentUser, fetchWithTokenRefresh } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  if (!user) {
    return <p>Loading...</p>;
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('profilePicture', profilePicture);

    try {
      const response = await fetchWithTokenRefresh(
        `${baseUrl}/api/user-update/${id}`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.message === 'Token expired, please login') {
          logout();
          navigate('/login');
        }
        setError(data.message || 'Error updating user profile');
        setIsLoading(false);
        return;
      }

      setUserData(data);
      setIsLoading(false);
      navigate(`/profile/${id}`);
    } catch (error) {
      if (error.name === 'AbortError') {
        setError('Request timed out');
      } else {
        setError('Error updating user profile');
      }
      console.error('Error updating user profile', error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className='container'>
        <div className='row pt-3'>
          <div className='col-lg-3'></div>
          <div className='col-lg-6'>
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
            <div className='bg-elements border border-0 rounded-3'>
              <div className='heading d-flex justify-content-between px-4 py-2'>
                <div className='d-flex'>
                  <BackLink /> <p className='ms-5'>EDIT PROFILE</p>
                </div>
                <div></div>
              </div>
              {preview && (
                <div className='my-3 ms-5'>
                  <img
                    src={preview}
                    alt='Profile Preview'
                    width='170'
                    height='170'
                  />
                </div>
              )}
              <div>
                <form
                  className='px-4 pt-3 pb-4'
                  onSubmit={handleSubmit}
                  encType='multipart/form-data'
                >
                  <div>
                    <label>Email:</label>
                    <input
                      type='email'
                      value={email}
                      onChange={handleEmailChange}
                      className='form-control mb-4 bg-input-txt border border-0 room-form-input'
                    />
                  </div>
                  <div>
                    <label>Profile Picture:</label>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleProfilePictureChange}
                      className='form-control mb-4 bg-input-txt border border-0 room-form-input'
                    />
                  </div>
                  <button
                    className='btn btns'
                    type='submit'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Submit'}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className='col-lg-3'></div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
