import moment from 'moment';
import { useAuth } from '../authContext/context';
import { memo } from 'react';
import { Link } from 'react-router-dom';

const Chat = ({ chat, deleteChat, isLoading }) => {
  const { currentUser, onlineUsers } = useAuth();
  const blank_img = import.meta.env.VITE_BLANK_IMG;
  // console.log('chats rendered');

  return (
    <div
      className={
        currentUser?.id === chat?.sender._id
          ? 'd-flex justify-content-end'
          : 'd-flex justify-content-start'
      }
    >
      <div className={currentUser?.id === chat?.sender._id
        ? 'border-start border-warning chat-mssg px-2 mb-1 sent-chat-bg rounded py-2'
        : 'border-start border-primary chat-mssg px-2 mb-1 bg-element-light rounded py-2'}>
        <div>
          <div className='d-flex justify-content-between'>
            <div className='d-flex f-sm '>
              {/* <img className="rounded-circle me-2 display-pic" src={chat?.sender?.profilePicture?.url || blank_img} alt="pic" /> */}
              <Link className='linkc' to={`/profile/${chat?.sender?._id}`}>
                <small className='dim me-2'>
                  @{chat?.sender?.username}
                  {onlineUsers.has(chat?.sender?._id) && (
                    <img 
                        width="10" height="10" 
                        src="https://img.icons8.com/forma-light-filled/14/40C057/circled.png" 
                        alt="online"
                        style={{ marginLeft: "3px" }}
                    />
                  )}
                </small>
              </Link>
              <span className='f-sm'>{moment(chat?.createdAt).fromNow()}</span>
            </div>
            <div>
              {currentUser?.id === chat?.sender?._id && (
                <div
                  className='text-danger pointer'
                  onClick={() => deleteChat(chat?._id)}
                >
                  <img
                    src='https://img.icons8.com/?size=100&id=43949&format=png&color=5d90e1'
                    alt=''
                    height={15}
                    width={15}
                  />
                </div>
              )}
            </div>
          </div>
          <div id='chat-self' className='text-light px-1'>
            {chat?.text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Chat);
