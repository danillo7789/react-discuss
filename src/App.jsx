import { useEffect, memo } from 'react';
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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
    
    if (!isLoading) {
      if (!isLoggedIn) {
        logout();
        navigate('/login');
      }
    }
  }, [isLoading, isLoggedIn, logout, navigate])


  return (
    <div>
      {isLoading ? (
        <div className="container-fluid full-height d-flex justify-content-center align-items-center">
          <div className="text-center">
              <div className="spinner-border" style={{width: '3rem', height: '3rem'}} role="status">
                  <span className="visually-hidden">Loading...</span>
              </div>
          </div>
        </div>
      ) : 
      (<div>
        <Navbar />
        <div className='container full-height'>
          <div id='temp-col-contain' className="row pt-3 full-height">
            <div id='topicfeed' className="col-lg-3 sticky-col">
              <TopicFeed />
            </div>
            
            <div id='roomfeed' className="col-lg-6 overflow">
              <RoomFeed />
            </div>
    
            <div id='activityfeed' className="col-lg-3 overflow">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>)}
    </div>
  )
}

export default memo(App)
