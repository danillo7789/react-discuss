import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../authContext/context";
import RoomCard from "./RoomCard";
import '../App.css'
import ActivityFeed from "./ActivityFeed";
import { baseUrl } from "../config/BaseUrl";
import { useQuery } from "@tanstack/react-query";

const getRooms = async(fetchWithTokenRefresh) => {
  const response = await fetchWithTokenRefresh(`${baseUrl}/api/get/room-feed`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }

  return response.json();
}

const RoomFeed = ({ filterFunction }) => {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const { logout, isLoggedIn, searchQuery, topicFilter, setTopicFilter, fetchWithTokenRefresh } = useAuth();
  const [visibleActivity, setVisibleActivity] = useState(false)
  const { id } = useParams()
  const location = useLocation();
  const currentPath = location.pathname;
  const prevRoomsLengthRef = useRef(rooms.length)
  

  const handleActivity = () => {
    setVisibleActivity(!visibleActivity)
  }

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getRooms(fetchWithTokenRefresh),
    enabled: isLoggedIn, 
    staleTime: 1000 * 60 * 15, 
    retry: 1, 
    onError: (err) => {
      if (err.message === 'Token expired, please login') {
        logout();
        navigate('/login');
      } else {
        console.error('Error fetching rooms:', err);
      }
    }
  });

  useEffect(() => {
    if (data) {
      setRooms(data);
    }
  }, [data]);

  useEffect(() => {
    if (rooms.length !== prevRoomsLengthRef.current) {
      refetch();
      prevRoomsLengthRef.current = rooms.length;
    }
  }, [rooms]);

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
            {error.message}
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
                filterActivity={filterActivitiesByHost} 
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
