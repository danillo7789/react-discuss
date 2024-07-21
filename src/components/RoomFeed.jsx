import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext/context";
import moment from "moment";

const RoomFeed = () => {
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
        setError(data.message || 'Failed to fetch rooms');
        return;
      }
      console.log('room-feed', data)
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
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
            <h6 className="dark">{rooms.length} rooms available</h6>
        </div>
        <div>
            <Link to='/create-room'><button className="btn btns">Create Room</button></Link>
        </div>
      </div>

      {rooms ? (
        rooms.map((room) => (
          <div className="my-3 px-4 pt-4 pb-3 bg-elements border border-0 rounded-3" key={room._id}>
            <div className="d-flex justify-content-between mb-1">
                <div className="d-flex">
                    <img className="rounded-circle me-2" src="sss" alt="pic" />
                    <small className="dim">@{room.host.username}</small>
                </div>
                <div>{moment(room.createdAt).fromNow()}</div>
            </div>

            <Link className="text-light link mb-1" to={`/room/${room._id}`}><h5>{room.name}</h5></Link>
            <hr className="divider bg-element-light" />
            <div className="d-flex justify-content-between">
                <small>{room.participants.length} Joined</small>
                <small className="border border-0 bg-element-light rounded-pill px-2 py-1 text-capitalize">{room.topic.name}</small>
            </div>
          </div>
        ))
      ) : (
        <p>No rooms available</p>
      )}
    </div>
  );
};

export default RoomFeed;
