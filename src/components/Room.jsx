import { useEffect, useState, memo, useCallback, useRef } from 'react';
import { baseUrl } from '../config/BaseUrl';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../authContext/context';
import Navbar from './Navbar';
import BackLink from './BackLink';
import moment from 'moment';
import Chat from './Chat';
import io from 'socket.io-client';
import uuid from 'react-uuid';

const socket = io(baseUrl);

const Room = () => {
  const [room, setRoom] = useState({});
  const [chats, setChats] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const { isLoggedIn, currentUser, fetchWithTokenRefresh, logout } = useAuth();
  const [message, setMessage] = useState('');
  const [chatPosted, setChatPosted] = useState(false);
  const [chatDeleted, setChatDeleted] = useState(false);
  const navigate = useNavigate();
  const blank_img = import.meta.env.VITE_BLANK_IMG;
  const [showActivity, setShowActivity] = useState(false);
  const chatContainerRef = useRef(null); // Create a ref for the chat container


  const getRoom = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetchWithTokenRefresh(`${baseUrl}/api/get/room/${id}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === 'Token expired, please login' || data.message === 'No token found') {
          logout();
          navigate('/login');
        }
        setError(data.message || 'Failed to fetch room');
        setIsLoading(false);
        return;
      }
      
      setRoom(data);
      // setChats(data.chats || []);
      setIsLoading(false);
    } catch (error) {
      setError('An error occurred while fetching room');
      setIsLoading(false);
      console.error('An error occurred while fetching room', error);
    }
  }, [id]);

  const postChat = async (e) => {
    e.preventDefault();
  
    const tempId = Date.now();
    // const newChat = {
    //   _id: tempId,
    //   sender: {
    //     _id: currentUser?.id,
    //     username: currentUser?.username,
    //     profilePicture: currentUser?.profilePicture,
    //   }, 
    //   text: message,
    //   createdAt: new Date().toISOString(),
    // };

    // updating the state instantly
    // setRoom(prevRoom => ({
    //   ...prevRoom,
    //   chats: [...prevRoom.chats, newChat],
    // }));
    setMessage('');

    try {
      const response = await fetchWithTokenRefresh(`${baseUrl}/api/post-chat/${id}`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === 'Token expired, please login' || data.message === 'No token found') {
          logout();
          navigate('/login');
        }
        setError(data.message || 'Error sending message');
        setIsLoading(false);
        return;
      }

      // setRoom(prevRoom => ({
      //   ...prevRoom,
      //   chats: prevRoom.chats.map(chat => 
      //       chat._id === tempId ? data : chat
      //   ),
      // }));

      socket.emit('send_message', { roomId: id, ...data });
      setMessage('');
      setChatPosted(true);
      setIsLoading(false);
    } catch (error) {
      setError('An error occurred while sending message');
      console.error('Error sending message', error);

      setRoom(prevRoom => ({
        ...prevRoom,
        chats: prevRoom.chats.map(chat => chat._id !== tempId)
      }));
      setIsLoading(false);
    }
  };

  const getChats = useCallback(async () => {
    try {
      const response = await fetchWithTokenRefresh(`${baseUrl}/api/get/chats/${id}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === 'Token expired, please login' || data.message === 'No token found') {
          logout();
          navigate('/login');
        }
        setError(data.message || 'Failed to fetch chats');
        return;
      }
      
      setRoom(prevRoom => ({
        ...prevRoom,
        chats: data.chats,
        participants: data.updatedRoom.participants
      }));

      setChats(data.chats);
    } catch (error) {
      setError('An error occurred while fetching chats');
      console.error('An error occurred while fetching chats', error);
    }
  }, [id, navigate]);

  const deleteChat = async (chatId) => {
    setChatDeleted(true);
    try {
      const response = await fetchWithTokenRefresh(`${baseUrl}/api/delete-chat/${chatId}`, {
        method: 'DELETE',
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setError(data.message || 'Failed to delete chat');
        return;
      }
  
      // Update state after successful deletion
      // setRoom(prevRoom => ({
      //   ...prevRoom,
      //   chats: prevRoom.chats.filter(chat => chat._id !== chatId)
      // }));
      getChats();
      socket.emit('delete_message', { roomId: id, chatId: data.deleted._id });
      setChatDeleted(false);
    } catch (error) {
      setError('An error occurred while deleting chat');
      console.error('Error deleting chat', error);
    }
  };
  
  const deleteRoom = async (roomId) => {
    setIsLoading(true);
    setError(''); 
  
    try {
      const response = await fetchWithTokenRefresh(`${baseUrl}/api/delete-room/${roomId}`, {
        method: 'DELETE',
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setError(data.message || 'Failed to delete room');
        setIsLoading(false);
        return;
      }
  
      setIsLoading(false);
      navigate('/');
    } catch (error) {
      setIsLoading(false);
      setError('An error occurred while deleting the room');
      console.error('Error deleting room:', error);
    }
  };
  
  const handleActivity = () => {
    setShowActivity(!showActivity);
  }

  useEffect(() => {
    getRoom();
    socket.emit('join_room', id);
  
    socket.on('receive_message', (newChat) => {
      // console.log('Received message:', newChat);
      setRoom((prevRoom) => ({
        ...prevRoom,
        chats: [...prevRoom.chats, newChat],
      }));
    });
  
    socket.on('delete_message', ({ chatId }) => {
      // console.log('Deleting message:', chatId);
      setRoom((prevRoom) => ({
        ...prevRoom,
        chats: prevRoom.chats.filter(chat => chat._id !== chatId)
      }));
    });
  
    return () => {
      socket.off('receive_message');
      socket.off('delete_message');
    };
  }, [id, getRoom]);
  

  useEffect(() => {
    if (isLoggedIn && (chatPosted || chatDeleted)) {
      getChats();
      setChatPosted(false);
      setChatDeleted(false);
    }
  }, [chatPosted, isLoggedIn, chatDeleted, getChats]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [room.chats]);

  return (
    <div>
      <Navbar />

      <div className='container'>
        <div className="row pt-3">
          {!showActivity && (
          <div className="col-lg-9">
            {error && 
              <div className="alert alert-danger text-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>
            }

            <div id='toggle-participants' onClick={handleActivity} className='linkc px-3 py-2 border border-secondary rounded-pill btn btnm mb-3'>
              {showActivity ? 'Hide Participants' : 'Show Participants'}
            </div>

            <div className='bg-elements border border-0 rounded-3'> 
              {isLoading ? (
                <div className="container-fluid full-height d-flex justify-content-center align-items-center">
                  <div className="text-center">
                      <div className="spinner-border" style={{width: '3rem', height: '3rem'}} role="status">
                          <span className="visually-hidden">Loading...</span>
                      </div>
                  </div>
                </div>
              ): 
              (<div className='heading px-4 pt-2'>
                  <div className='d-flex justify-content-between'>
                      <BackLink />
                      <div className="">
                        <p className='fw-bold'>{room?.name}</p>        
                      </div>
                      {room && room?.host?._id === currentUser?.id && (
                          <div className='d-flex'>
                              <Link className='linkc' to={`/update-room/${room?._id}`}><div className='me-2 f-sm text-info'>Edit</div></Link>
                              <div onClick={() => deleteRoom(room?._id)} className='text-danger f-sm pointer'>Delete</div>
                          </div>
                      )}
                      {room && room?.host?._id !== currentUser?.id && (
                          <div className='d-flex'>
                                
                          </div>
                      )}                               
                  </div>
              </div>)}
                
                <div className='d-flex justify-content-between'>
                    <div className='px-4 pb-3'>
                        <div className='mb-1'>HOSTED BY 
                          <Link className='linkc' to={`/profile/${room?.host?._id}`}>
                            <span className='dim mb-1'> @{room?.host?.username}</span>
                          </Link>
                        </div>
                        <div className="d-flex mb-2">
                          <img className="rounded-circle me-2 display-pic" src={room?.host?.profilePicture?.url || blank_img} alt="display picture" />
                        </div>
                        <small className="border border-0 bg-element-light rounded-pill px-2 py-1 text-capitalize nav-text">{room?.topic?.name}</small>
                    </div>
                    <div className="d-flex px-4 py-3">                        
                        <div>{moment(room?.createdAt).fromNow()}</div>
                    </div>
                </div>

              <div className='px-4 pb-3'>

                <div className='message-box p-3 rounded' ref={chatContainerRef}>
                  {room?.chats?.map(chat => (
                    <Chat
                      key={uuid()}
                      chat={chat} 
                      deleteChat={deleteChat}
                      isLoading={isLoading} />
                  ))}
                </div>

                <div className='rounded bg-heading'>
                  <form onSubmit={postChat}>
                    <div className='d-flex'>
                      <input
                        type="text"
                        placeholder='Write your message here'
                        value={message}
                        className='form-control chat-box py-2 border border-0 room-form-input bg-input-txt'
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn btns">Send</button>
                    </div>
                  </form>
                </div>
                
              </div>
            </div>
          </div>)}

          {showActivity && (
          <div>
            <div onClick={handleActivity} className='linkc px-3 py-2 border border-secondary rounded-pill btn btnm mb-3'>
              {showActivity ? 'Hide Participants' : 'Show Participants'}
            </div>

            <div className="col-lg-3">
              <div className='bg-elements border border-0 rounded-3'>
                <div className='heading d-flex justify-content-between px-4 pt-2'>
                  PARTICIPANTS <small>({room?.participants?.length} Joined)</small>
                </div>

                <div className='px-4 py-3'>
                  {room?.participants?.map(user => (
                    <div key={user?._id} className="d-flex mb-2">
                      <img className="rounded-circle me-2 display-pic" src={user?.profilePicture?.url || blank_img} alt="display picture" />
                      <Link className='linkc' to={`/profile/${user?._id}`}><small className='dim mt-2'>@{user?.username}</small></Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>)}

          <div id='participants' className='col-lg-3' >
            <div className='bg-elements border border-0 rounded-3'>
              <div className='heading d-flex justify-content-between px-4 pt-2'>
                PARTICIPANTS <small>({room?.participants?.length} Joined)</small>
              </div>

              <div className='px-4 py-3'>
                {room?.participants?.map(user => (
                  <div key={user?._id} className="d-flex mb-2">
                    <img className="rounded-circle me-2 display-pic" src={user?.profilePicture?.url || blank_img} alt="display picture" />
                    <Link className='linkc' to={`/profile/${user?._id}`}><small className='dim mt-2'>@{user?.username}</small></Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default memo(Room);
