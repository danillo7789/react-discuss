import React, { useEffect, useState } from 'react';
import { baseUrl } from '../config/BaseUrl';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import BackLink from './BackLink';
import { useAuth } from '../authContext/context';


const CreateRoom = () => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout, fetchWithTokenRefresh } = useAuth()
  const [isLoading, setIsLoading] = useState(false);

  const fetchTopics = async () => {
    try {
      const response = await fetchWithTokenRefresh(`${baseUrl}/api/get/topic-feed`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message == 'Token expired, please login') {
          logout();
          navigate('/login')
        }
        setError(data.message || 'Failed to fetch topics');
        return;
      }
      
      setTopics(data.topicsObject);
    } catch (error) {
      setError('An error occurred while fetching topics');
      console.error('Error fetching topics:', error);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const postRoom = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetchWithTokenRefresh(`${baseUrl}/api/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, topic, description })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message == 'Token expired, please login') {
          logout();
          navigate('/login')
        }
        setError(data.message || 'Error creating room');
        return;
      }

      setName('');
      setTopic('');
      setDescription('');
      setIsLoading(false)
      navigate(`/room/${data._id}`);
    } catch (error) {
      setError('An error occurred while creating room');
      console.error('Error creating room:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="row pt-5">
            <div className="col-lg-3"></div>
            <div className="col-lg-6">
                {error && 
                <div className="alert alert-danger text-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>}
                <div className='bg-elements border border-0 rounded-3'>
                    <div className='heading d-flex justify-content-between px-4 py-2'>
                        <div className='d-flex'><BackLink /> <p className='ms-5'>CREATE ROOM</p></div>
                        <div></div>
                    </div>
                    <form className='px-4 pt-3 pb-4' onSubmit={postRoom}>
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
                        <button className='btn btns' type="submit">{isLoading ? 'Creating...' : 'Create Room'}</button>
                    </form>
                </div>
            </div>
          <div className="col-lg-3"></div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
