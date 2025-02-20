import { useEffect, useState, useRef } from 'react';
import { baseUrl } from '../config/BaseUrl';
import { useAuth } from '../authContext/context';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const fetchTopics = async (fetchWithTokenRefresh) => {
  const response = await fetchWithTokenRefresh(
    `${baseUrl}/api/get/topic-feed`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch topics');
  }

  return response.json();
};

const TopicFeed = () => {
  const [topics, setTopics] = useState([]);
  const [topicCount, setTopicCount] = useState('');
  const { isLoggedIn, logout, setTopicFilter, fetchWithTokenRefresh } =
    useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const prevTopicsLengthRef = useRef(topics.length);

  const handleSearchInput = () => {
    setShowSearch(!showSearch);
  };

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['topics'], // Query key
    queryFn: () => fetchTopics(fetchWithTokenRefresh), // Query function
    enabled: isLoggedIn, // Options
    retry: 1,
    staleTime: 1000 * 60 * 60 * 6,
    onError: (err) => {
      if (err.message === 'Token expired, please login') {
        logout();
        navigate('/login');
      } else {
        console.error('An error occured while fetching topics', err);
      }
    },
  });

  useEffect(() => {
    if (data) {
      setTopics(data.topicsObject);
      setTopicCount(data.uniqueTopicsCount);
    }
  }, [data]);

  useEffect(() => {
    if (topics.length !== prevTopicsLengthRef.current) {
      refetch();
      prevTopicsLengthRef.current = topics.length;
    }
  }, [topics]);

  if (isLoading) {
    return (
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
    );
  }

  const topicLimit = topics.slice(0, 11);

  return (
    <div className='px-2'>
      {error && (
        <div
          className='alert alert-danger text-danger alert-dismissible fade show'
          role='alert'
        >
          {error.message}
          <button
            type='button'
            className='btn-close'
            data-bs-dismiss='alert'
            aria-label='Close'
          ></button>
        </div>
      )}
      <h5 className=''>Browse Topics</h5>
      <div
        className='d-flex justify-content-between pointer'
        onClick={() => setTopicFilter('')}
      >
        <p className='white fw-bold'>All</p>
        <p className='border border-0 px-2 py-1 bg-box white fw-bold'>
          {topicCount}
        </p>
      </div>

      {showSearch ? (
        <form className='pt-3 pb-2'>
          <div className='mb-3'>
            <input
              className='form-control me-2 bg-input-txt border border-0'
              id='searchbar'
              type='search'
              placeholder='Search for topics'
              aria-label='Search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      ) : null}

      {topics.length > 0 ? (
        (search === '' ? topicLimit : topics)
          .filter((topic) =>
            search === ''
              ? true
              : topic?.topic?.toLowerCase().includes(search.toLowerCase())
          )
          .map((topic) => (
            <div
              className='d-flex justify-content-between pointer'
              key={topic?.topic}
              onClick={() => setTopicFilter(topic?.topic)}
            >
              <p className='text-capitalize me-4'>{topic?.topic}</p>
              <p className='border border-0 px-2 py-1 bg-nav'>{topic?.count}</p>
            </div>
          ))
      ) : (
        <p>No topics available</p>
      )}

      <div
        onClick={handleSearchInput}
        className='d-flex justify-content-between pointer'
      >
        <div className='dim'>{showSearch ? 'Less' : 'More'}</div>
        {showSearch ? (
          <img
            width='24'
            height='24'
            src='https://img.icons8.com/color/24/collapse-arrow.png'
            alt='collapse-arrow'
          />
        ) : (
          <img
            width='24'
            height='24'
            src='https://img.icons8.com/ios-glyphs/30/7F91EB/expand-arrow--v1.png'
            alt='expand-arrow--v1'
          />
        )}
      </div>
    </div>
  );
};

export default TopicFeed;
