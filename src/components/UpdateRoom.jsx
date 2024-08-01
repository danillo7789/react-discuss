import React, { useEffect, useState } from 'react';
import { baseUrl } from '../config/BaseUrl';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import BackLink from './BackLink';
import { useAuth } from '../authContext/context';

const UpdateRoom = () => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [description, setDescription] = useState('');
  const [room, setRoom] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true); 
  const [updating, setUpdating] = useState(false); 
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchWithTokenRefresh } = useAuth();

  const fetchTopics = async () => {
    try {
      const response = await fetchWithTokenRefresh(`${baseUrl}/api/get/topic-feed`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to fetch topics');
        return;
      }

      setTopics(data.topicsObject);
    } catch (error) {
      setError('An error occurred while fetching topics');
      console.error('Error fetching topics:', error);
    }
  };

  const fetchRoom = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithTokenRefresh(`${baseUrl}/api/get/room/${id}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to fetch room');
        setIsLoading(false);
        return;
      }

      setRoom(data);
      setName(data.name);
      setTopic(data.topic?.name || '');
      setDescription(data.description || '');
      setIsLoading(false);
    } catch (error) {
      setError('An error occurred while fetching room');
      setIsLoading(false);
      console.error('An error occurred while fetching room', error);
    }
  };

  const editRoom = async (e) => {
    e.preventDefault();
    setUpdating(true)
    setError('');

    try {
      const response = await fetchWithTokenRefresh(`${baseUrl}/api/update-room/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, topic, description })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message == 'Token expired, please login') {
          logout();
          navigate('/login')
        }
        setError(data.message || 'Error updating room');
        return;
      }

      setName('');
      setTopic('');
      setDescription('');
      navigate(`/room/${id}`);
    } catch (error) {
      setError('An error occurred while updating room');
      console.error('Error updating room:', error);
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchRoom();
  }, []);

  useEffect(() => {
    // Set firstLoad to false once room data has been set
    if (room.name || room.topic?.name || room.description) {
      setFirstLoad(false);
    }
  }, [room]);

  if (isLoading) {
    <div className="container-fluid full-height d-flex justify-content-center align-items-center">
      <div className="text-center">
          <div className="spinner-border" style={{width: '3rem', height: '3rem'}}  role="status">
              <span className="visually-hidden">Loading...</span>
          </div>
      </div>
    </div>
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="row pt-3">
            <div className="col-lg-3"></div>
            <div className="col-lg-6">
                {error && 
                <div className="alert alert-danger text-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>}
                <div className='bg-elements border border-0 rounded-3'>
                <div className='heading d-flex justify-content-between px-4 py-2'>
                    <div className='d-flex'><BackLink /> <p className='ms-2'>EDIT ROOM</p></div>
                    <div></div>
                </div>
                <form className='px-4 pt-3 pb-4' onSubmit={editRoom}>
                    <div>
                        <label className='pb-2'>Topic</label>
                        <input
                            type="text"
                            className='form-control mb-4 bg-input-txt border border-0 room-form-input'
                            placeholder='Enter or select a topic'
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            list='topic-list'
                            required
                        />
                        <datalist id='topic-list'>
                            {topics.map(eachTopic => (
                                <option key={eachTopic.topic} value={eachTopic.topic} />
                            ))}
                        </datalist>
                    </div>
                    <div>
                        <label className='pb-2'>Name</label>
                        <input
                            type="text"
                            className='form-control mb-4 bg-input-txt border border-0 room-form-input'
                            placeholder='Room Name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className='pb-2'>Description</label>
                        <textarea
                            type="text"
                            className='form-control mb-5 bg-input-txt border border-0 description-input txtarea'
                            placeholder='Description'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <button className='btn btns' type="submit">{updating ? 'Updating...' : 'Update Room'}</button>
                </form>
                </div>
            </div>
          <div className="col-lg-3"></div>
        </div>
      </div>
    </div>
  );
};

export default UpdateRoom;
