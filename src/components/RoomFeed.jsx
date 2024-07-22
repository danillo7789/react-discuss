import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext/context";
import RoomCard from "./RoomCard";

const RoomFeed = ({ filterFunction }) => {
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const { logout, isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const getRooms = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No token found');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/get/room-feed', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(data?.message || 'Failed to fetch rooms');
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

  if (error && error == 'Token expired') {
    logout();
    navigate('/');
  }

  useEffect(() => {
    if (isLoggedIn) {
        getRooms();
    }
  }, [isLoggedIn]);

  const filteredRooms = filterFunction ? rooms?.filter(filterFunction) : rooms;

  return (
    <div>
      {error && 
        <div class="alert alert-danger text-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>}
      <div className="d-flex justify-content-between">
        <div>
            <h5>Diskors</h5>
            <h6 className="dark">{filteredRooms?.length} rooms available</h6>
        </div>
        <div>
            <Link to='/create-room'><button className="btn btns">Create Room</button></Link>
        </div>
      </div>


      {isLoading ? (
        <div>Loading...</div>
      ) : filteredRooms.length > 0 ? (
        filteredRooms.map((room) => <RoomCard key={room?._id} room={room} />)
      ) : (
        <p>No rooms available</p>
      )}
    </div>
  );
};

export default RoomFeed;
