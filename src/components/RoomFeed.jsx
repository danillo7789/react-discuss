import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../authContext/context";
import RoomCard from "./RoomCard";
import '../App.css'
import ActivityFeed from "./ActivityFeed";
import { baseUrl } from "../config/BaseUrl";

const RoomFeed = ({ filterFunction }) => {
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const { logout, isLoggedIn, searchQuery, topicFilter, setTopicFilter } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [visibleActivity, setVisibleActivity] = useState(false)
  const { id } = useParams()
  const location = useLocation();
  const currentPath = location.pathname;

  const handleActivity = () => {
    setVisibleActivity(!visibleActivity)
  }

  const getRooms = async () => {
    setError('');
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No token found');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/get/room-feed`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message == 'Token expired, please login') {
            logout();
            navigate('/login')
        }
        setIsLoading(false);
        setError(data.message || 'Failed to fetch rooms');
        return;
      }
      
      setIsLoading(false);
      setRooms(data);
    } catch (error) {
        setIsLoading(false);
        setError('An error occurred while fetching rooms');
        console.error('Error fetching rooms:', error);
    }
  };


  useEffect(() => {
    if (isLoggedIn) {
        getRooms();
    }
  }, [isLoggedIn]);

//   const filteredRooms = filterFunction ? rooms?.filter(filterFunction) : rooms;

  const filteredRooms = rooms
    .filter(room => filterFunction ? filterFunction(room) : true)
    .filter(room => searchQuery ? room?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) : true)
    .filter(room => topicFilter ? room?.topic?.name?.toLowerCase() === topicFilter.toLowerCase() : true);

    const filterActivitiesByHost = (activity) => activity?.room?.host?._id === id || activity

    const handleTopic = () => {
        if (currentPath === '/topics') {
            window.location.reload()
        }
    }


  return (
    <div>
      {error && 
        <div className="alert alert-danger text-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        }

        {!visibleActivity &&
        (<div id="mobile-btn-roomfeed">
            <div id="mobile-btns" className="d-flex justify-content-center mb-3">
                <Link onClick={handleActivity} className="linkc px-3 py-2 border border-secondary rounded-pill btn btnm me-3">Recent Activities</Link>
                <div id='browse-topics-btn'>
                    <Link to='/topics' onClick={handleTopic} className="linkc px-3 py-2 border border-secondary rounded-pill btn btnm">Browse Topics</Link>
                </div>                
            </div>
        </div>)}

        {visibleActivity && 
        (<div id={visibleActivity ? '' : 'activityfeedp'} className="col-lg-3 overflow">
            <ActivityFeed 
                filterFunc={filterActivitiesByHost} 
                visibleActivity={visibleActivity}
                setVisibleActivity={setVisibleActivity} />
        </div>)}
        

      {!visibleActivity &&
      (<div className="d-flex justify-content-between">
        <div>
            <h5>Diskors</h5>
            <h6 className="dark">{filteredRooms?.length} rooms available</h6>            
        </div>
        <div className="d-flex">
            <Link to='/create-room'><button className="btn btns me-2">Create Room</button></Link>
            <Link onClick={()=> setTopicFilter('')} >
                <button className="btn btns me-2">All Rooms</button>
            </Link>
        </div>
      </div>)}


      {isLoading ? (
        <div className="container-fluid full-height d-flex justify-content-center align-items-center">
          <div className="text-center">
              <div className="spinner-border" style={{width: '3rem', height: '3rem'}} role="status">
                  <span className="visually-hidden">Loading...</span>
              </div>
          </div>
        </div>
      ) : filteredRooms.length > 0 && !visibleActivity ? (
        filteredRooms.map((room) => <RoomCard key={room?._id} room={room} />)
      ) : !visibleActivity && (
        <p>No rooms available</p>
      )}
    </div>
  );
};

export default RoomFeed;
