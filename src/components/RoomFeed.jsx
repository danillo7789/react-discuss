import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext/context";
import RoomCard from "./RoomCard";

const RoomFeed = ({ filterFunction }) => {
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const { logout, isLoggedIn, searchQuery } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  console.log('roomfeed', searchQuery)

  const getRooms = async () => {
    setError('');
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No token found');
      setIsLoading(false);
      navigate('/feed')
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
    .filter(room => searchQuery ? room?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) : true);


  return (
    <div>
      {error && 
        <div className="alert alert-danger text-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        }
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
