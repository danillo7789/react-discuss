import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../authContext/context';
import Navbar from './Navbar';
import BackLink from './BackLink';
import { baseUrl } from '../config/BaseUrl';
import RoomFeed from './RoomFeed';
import { useNavigate } from 'react-router-dom';

const BrowseTopics = () => {
  const [search, setSearch] = useState('');
  const { isLoggedIn, setTopicFilter, logout, fetchWithTokenRefresh } =
    useAuth();
  const [error, setError] = useState('');
  const [topics, setTopics] = useState([]);
  const [topicCount, setTopicCount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topicClicked, setTopicClicked] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleTopicFilter = (topic) => {
    setTopicFilter(topic);
    setTopicClicked(true);
  };

  const getTopicDetails = useCallback(async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetchWithTokenRefresh(
        `${baseUrl}/api/get/topic-feed`,
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.message == 'Token expired, please login') {
          logout();
          navigate('/login');
        } else {
          setIsLoading(false);
          setError(data.message || 'Failed to fetch topics');
          return;
        }
      }

      setIsLoading(false);
      setTopics(data.topicsObject);
      setTopicCount(data.uniqueTopicsCount);
    } catch (error) {
      setIsLoading(false);
      setError('An error occurred while fetching topics');
      console.error('Error fetching topics:', error);
    }
  }, [topics.length]);

  useEffect(() => {
    if (isLoggedIn) {
      getTopicDetails();
    }
  }, [isLoggedIn, topics.length]);

  const tenTopics = topics.slice(0, 10);

  return (
    <div>
      <Navbar />
      <div className='container'>
        <div className='row pt-5'>
          <div className='col-lg-3'></div>
          {!topicClicked && (
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
                    <BackLink />
                    <p className='ms-5'>Browse Topics</p>
                  </div>
                  <div></div>
                </div>
                <form className='px-4 pt-3 pb-4'>
                  <div className='mb-3'>
                    <input
                      className='form-control me-2 bg-input-txt border border-0'
                      id='searchbar'
                      type='search'
                      placeholder='Search for topics'
                      aria-label='Search'
                      value={search}
                      onChange={handleSearchChange}
                    />
                  </div>

                  <div>
                    <div className='d-flex justify-content-between pointer'>
                      <p className='dim fw-bold'>All</p>
                      <p className='dim'>{topicCount}</p>
                    </div>

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
                    ) : topics.length > 0 ? (
                      (search === '' ? tenTopics : topics)
                        .filter((topic) =>
                          search === ''
                            ? true
                            : topic?.topic
                                ?.toLowerCase()
                                .includes(search.toLowerCase())
                        )
                        .map((topic) => (
                          <div
                            className='d-flex justify-content-between pointer'
                            key={topic?.topic}
                            onClick={() => handleTopicFilter(topic?.topic)}
                          >
                            <p className='text-capitalize me-4'>
                              {topic?.topic}
                            </p>
                            <p className=''>{topic?.count}</p>
                          </div>
                        ))
                    ) : (
                      <p>No topics available</p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {topicClicked && (
            <div className='col-lg-6'>
              <RoomFeed />
            </div>
          )}
          <div className='col-lg-3'></div>
        </div>
      </div>
    </div>
  );
};

export default BrowseTopics;
