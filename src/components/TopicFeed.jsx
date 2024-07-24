import { useEffect, useState, memo, useCallback } from "react";
import { baseUrl } from "../config/BaseUrl";
import { useAuth } from "../authContext/context";
import { useNavigate } from "react-router-dom";

const TopicFeed = () => {
  const [error, setError] = useState('');
  const [topics, setTopics] = useState([]);
  const [topicCount, setTopicCount] = useState('');
  const { isLoggedIn, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // console.log('topic feed rendered');


  const getTopicDetails = useCallback(async () => {
    setError('');
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No token found');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/get/topic-feed`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message == 'Token expired, please login') {
          logout()
          navigate('/login')
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
  }, [topics.length])

  useEffect(() => {
    if (isLoggedIn){
      getTopicDetails();
    }
  }, [isLoggedIn, topics.length]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-2">
      {error && 
        <div className="alert alert-danger text-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>}
      <h5 className="">Browse Topics</h5>
      <div className="d-flex justify-content-between">
        <p className="dark fw-bold">All</p> <p className="border border-0 px-2 py-1 bg-nav">{topicCount}</p>
      </div>
      {topics ? (
        topics.map((topic, index) => (
          <div className="d-flex justify-content-between" key={index}>
            <p className="text-capitalize me-4">{topic.topic}</p> <p className="border border-0 px-2 py-1 bg-nav">{topic.count}</p>
          </div>
        ))
      ) : (
        <p>No topics available</p>
      )}
    </div>
  );
};

export default memo(TopicFeed);
