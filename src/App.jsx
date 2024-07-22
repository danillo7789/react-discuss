import { useEffect } from 'react';
import './App.css'
import { useAuth } from './authContext/context';
import Navbar from './components/Navbar'
import RoomFeed from './components/RoomFeed';
import TopicFeed from './components/TopicFeed';
import { useNavigate } from 'react-router-dom';
import ActivityFeed from './components/ActivityFeed';

function App() {
  const { isLoggedIn, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        logout();
        navigate('/');
      }
    }
  }, [isLoading, isLoggedIn, logout, navigate])

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
  
      <div className='container full-height'>
        <div className="row pt-3 full-height">
          <div className="col-lg-3 sticky-col">
            <TopicFeed />
          </div>
          
          <div className="col-lg-6 overflow">
            <RoomFeed />
          </div>
  
          <div className="col-lg-3 overflow">
            <ActivityFeed />
          </div>
        </div>
      </div>
    </>
  )
  
  
}

export default App
