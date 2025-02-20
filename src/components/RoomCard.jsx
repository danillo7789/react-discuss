import moment from 'moment';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext/context';

const RoomCard = ({ room }) => {
  const blank_img = import.meta.env.VITE_BLANK_IMG;
  const { onlineUsers } = useAuth()
  // console.log('room card rendered');

  return (
    <div className='my-3 px-4 pt-4 pb-3 bg-elements border border-0 rounded-3'>
      <div className='d-flex justify-content-between mb-2'>
        <div className='d-flex'>
          <img
            className='rounded-circle me-2 display-pic'
            src={room?.host?.profilePicture?.url || blank_img}
            alt='display picture'
          />
          <Link className='linkc' to={`/profile/${room?.host?._id}`}>
            <small className='dim pt-2'>
              @{room?.host?.username}
              {onlineUsers.has(room?.host?._id) && (
                <img 
                  width="10" height="10" 
                  src="https://img.icons8.com/forma-light-filled/14/40C057/circled.png" 
                  alt="online"
                  style={{ marginLeft: "3px" }}
                />
              )}
            </small>
          </Link>
        </div>
        <div className='pt-2'>{moment(room?.createdAt).fromNow()}</div>
      </div>

      <Link className='linkc text-capitalize mb-5' to={`/room/${room?._id}`}>
        <h5 className='room-name'>{room?.name}</h5>
      </Link>
      <hr className='divider bg-element-light' />
      <div className='d-flex justify-content-between'>
        <small>{room?.participants?.length} Joined</small>
        <small className='border border-0 bg-element-light rounded-pill px-2 py-1 text-capitalize'>
          {room?.topic?.name}
        </small>
      </div>
    </div>
  );
};

export default memo(RoomCard);
