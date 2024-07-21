import { useEffect, useState } from 'react';
import { baseUrl } from '../config/BaseUrl';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../authContext/context';
import Navbar from './Navbar';
import BackLink from './BackLink';
import moment from 'moment';

const Room = () => {
  const [room, setRoom] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const { isLoggedIn, currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [chatPosted, setChatPosted] = useState(false);
  const [chatDeleted, setChatDeleted] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const getRoom = async () => {
    setIsLoading(true);

    if (!token) {
      setError('No token found');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/get/room/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to fetch room');
        setIsLoading(false);
        return;
      }
      
      setRoom(data);
      setIsLoading(false);
    } catch (error) {
      setError('An error occurred while fetching room');
      setIsLoading(false);
      console.error('An error occurred while fetching room', error);
    }
  };

  const postChat = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('No token found');
      return;
    }

    const tempId = Date.now(); // Generate a temporary ID for the new chat
    const newChat = {
      _id: tempId,
      sender: { username: currentUser.username }, // Replace 'current_user' with actual current user's username
      text: message,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update the state instantly
    setRoom(prevRoom => ({
      ...prevRoom,
      chats: [...prevRoom.chats, newChat],
    }));

    try {
      const response = await fetch(`${baseUrl}/api/post-chat/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error sending message');
        return;
      }

    // Update the chat with the actual ID from the server
    setRoom(prevRoom => ({
        ...prevRoom,
        chats: prevRoom.chats.map(chat => 
            chat._id === tempId ? data : chat
        ),
    }));

      setMessage(''); 
      setChatPosted(true); 
    } catch (error) {
      setError('An error occurred while sending message');
      console.error('Error sending message', error);

    // Revert the optimistic update
    setRoom(prevRoom => ({
        ...prevRoom,
        chats: prevRoom.chats.filter(chat => chat._id !== tempId),
    }));
    }
  };

  const getChats = async () => {
    if (!token) {
      setError('No token found');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/get/chats/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to fetch chats');
        return;
      }
      
      setRoom(prevRoom => ({
        ...prevRoom,
        chats: data.chats, // also updating chats
        participants: data.updatedRoom.participants //also updating participants
      }));
    } catch (error) {
      setError('An error occurred while fetching chats');
      console.error('An error occurred while fetching chats', error);
    }
  };

  const deleteChat = async (chatId) => {
    if (!token) {
      setError('No token found');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/delete-chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to delete chat');
        return;
      }

      setChatDeleted(true)
      getChats();
    } catch (error) {
      setError('An error occurred while deleting chat');
      console.error('Error deleting chat', error);
    }
  };

  const deleteRoom = async (roomId) => {
    setIsLoading(true);
    setError(''); 
  
    if (!token) {
      setIsLoading(false);
      setError('No token found');
      return;
    }
  
    try {
      const response = await fetch(`${baseUrl}/api/delete-room/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setError(data.message || 'Failed to delete room');
        setIsLoading(false);
        return;
      }
  
      setIsLoading(false);
      navigate('/home');
    } catch (error) {
      setIsLoading(false);
      setError('An error occurred while deleting the room');
      console.error('Error deleting room:', error);
    }
  };
  

  useEffect(() => {
    getRoom();
  }, []);

  useEffect(() => {
    if (isLoggedIn && (chatPosted || chatDeleted)) {
      getChats();
      setChatPosted(false);
      setChatDeleted(false);
    }
  }, [chatPosted, isLoggedIn, chatDeleted]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />

      <div className='container'>
        <div className="row pt-3">
          <div className="col-lg-9">
            {error && 
              <div className="alert alert-danger text-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>}
            <div className='bg-elements border border-0 rounded-3'>
              <div className='heading btns d-flex justify-content-between px-4 pt-2'>
                <BackLink />
                {room && room?.host?._id === currentUser?.id && (
                    <div className='d-flex'>
                        <Link className='link' to={`/update-room/${room?._id}`}><div className='me-2 f-sm text-info'>Edit</div></Link>
                        <div onClick={() => deleteRoom(room?._id)} className='text-danger f-sm pointer'>Delete</div>
                    </div>
                )}
              </div>

              <div className="d-flex justify-content-between px-4 py-3">
                <h4 className='fw-bold'>{room?.name}</h4>
                <div>{moment(room?.createdAt).fromNow()}</div>
              </div>
              <div className='px-4 pb-3'>
                <div>HOSTED BY <span className='dim mb-1'>@{room?.host?.username}</span></div>
                <div className="d-flex mb-2">
                  <img className="rounded-circle me-2" src="sss" alt="pic" />
                  <small className='dim'>@{room?.host?.username}</small>
                </div>
                <small className="border border-0 bg-element-light rounded-pill px-2 py-1 text-capitalize">{room?.topic?.name}</small>
              </div>

              <div className='px-4 pb-3'>
                <div className='message-box p-4 rounded'>
                  {room?.chats?.map(chat => (
                    <div key={chat?._id} className='chat border-start border-primary px-3 mb-2 bg-element-light rounded py-3'>
                        <div className='d-flex justify-content-between'>
                            <div className="d-flex f-sm pb-2">
                                <img className="rounded-circle me-2" src="sss" alt="pic" />
                                <small className='dim me-2'>@{chat?.sender?.username}</small>
                                <span>{moment(chat?.createdAt).fromNow()}</span>
                            </div>
                            <div>
                            {currentUser?.id === chat?.sender?._id && (
                                <div className='text-danger f-sm pointer' onClick={() => deleteChat(chat?._id)}>Delete</div>
                            )}
                            </div>
                        </div>
                      <div className='text-light px-1'>{chat?.text}</div>
                    </div>
                  ))}
                </div>
                <div className='rounded bg-heading'>
                  <form onSubmit={postChat}>
                    <div className='d-flex'>
                      <input
                        type="text"
                        placeholder='Write your message here'
                        value={message}
                        className='form-control mb-3 chat-box py-2 border border-0 room-form-input bg-input-txt'
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn btn-primary ">Send</button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>

          <div className="col-lg-3">
            <div className='bg-elements border border-0 rounded-3'>
              <div className='heading d-flex justify-content-between px-4 pt-2'>
                PARTICIPANTS <small>({room?.participants?.length} Joined)</small>
              </div>

              <div className='px-4 py-3'>
                {room?.participants?.map(user => (
                  <div key={user?._id} className="d-flex">
                    <img className="rounded-circle me-2 mb-2" src="sss" alt="pic" />
                    <small className='dim'>@{user?.username}</small>
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

export default Room;
