import { useEffect, useState, memo, useCallback } from "react";
import { baseUrl } from "../config/BaseUrl";
import { useAuth } from "../authContext/context";
import { useNavigate } from "react-router-dom";

const TopicFeed = () => {
  const [error, setError] = useState('');
  const [topics, setTopics] = useState([]);
  const [topicCount, setTopicCount] = useState('');
  const { isLoggedIn, logout, setTopicFilter, fetchWithTokenRefresh } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearchInput = () => {
    setShowSearch(!showSearch);
  }

  // console.log('topic feed rendered');

  const getTopicDetails = useCallback(async () => {
    setError('');
    setIsLoading(true);

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
    return (
      <div className="container-fluid full-height d-flex justify-content-center align-items-center">
        <div className="text-center">
            <div className="spinner-border" style={{width: '3rem', height: '3rem'}}  role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
      </div>
    );
  }

  const fiveTopics = topics.slice(0, 5);

  return (
    <div className="px-2">
      {error && 
        <div className="alert alert-danger text-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>}
      <h5 className="">Browse Topics</h5>
      <div className="d-flex justify-content-between pointer" onClick={()=> setTopicFilter('')}>
        <p className="dark fw-bold">All</p>
        <p className="border border-0 px-2 py-1 bg-box dark fw-bold">{topicCount}</p>
      </div>

      {showSearch ? 
      (<form className='pt-3 pb-2'>
        <div className="mb-3">
            <input
                className="form-control me-2 bg-input-txt border border-0"
                id='searchbar'
                type="search"
                placeholder="Search for topics"
                aria-label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </form>) : null}

      {topics.length > 0 ? (
        (search === '' ? fiveTopics : topics)
        .filter(topic => search === '' ? true : topic?.topic?.toLowerCase().includes(search.toLowerCase()))
        .map((topic) => (
            <div className="d-flex justify-content-between pointer" key={topic?.topic} onClick={() => setTopicFilter(topic?.topic)}>                                    
                <p className="text-capitalize me-4">{topic?.topic}</p>
                <p className="border border-0 px-2 py-1 bg-nav">{topic?.count}</p>
            </div>                                                                                          
        ))
      ) : (
          <p>No topics available</p>
      )}
      
      <div onClick={handleSearchInput} className="d-flex justify-content-between pointer">
        <div className="dim">{showSearch ? 'Less' : 'More'}</div>
        {showSearch ? <img width="24" height="24" src="https://img.icons8.com/color/24/collapse-arrow.png" alt="collapse-arrow"/> :
        <img width="24" height="24" src="https://img.icons8.com/ios-glyphs/30/7F91EB/expand-arrow--v1.png" alt="expand-arrow--v1"/>}
      </div>
    </div>
  )  
}

export default TopicFeed