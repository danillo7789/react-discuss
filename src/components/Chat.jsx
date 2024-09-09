import moment from "moment";
import { useAuth } from "../authContext/context";
import { memo } from "react";
import { Link } from "react-router-dom";


const Chat = ({ chat, deleteChat, isLoading }) => {
    const { currentUser } = useAuth();
    const blank_img = import.meta.env.VITE_BLANK_IMG;
    // console.log('chats rendered');

  return (
    <div className={currentUser?.id === chat?.sender._id ? 'd-flex justify-content-end' : 'd-flex justify-content-start'}>
        <div className='border-start border-primary chat-mssg px-2 mb-1 bg-element-light rounded py-2'>
            <div>
                <div className='d-flex justify-content-between'>
                    <div className="d-flex f-sm ">
                        {/* <img className="rounded-circle me-2 display-pic" src={chat?.sender?.profilePicture?.url || blank_img} alt="pic" /> */}
                        <Link className="linkc" to={`/profile/${chat?.sender?._id}`}>
                            <small className='dim me-2'>@{chat?.sender?.username}</small>
                        </Link>
                        <span className="f-sm">{moment(chat?.createdAt).fromNow()}</span>
                    </div>
                    <div>
                        {currentUser?.id === chat?.sender?._id && (
                            <div className='text-danger pointer' onClick={() => deleteChat(chat?._id)}>x</div>
                        )}
                    </div>
                </div>
                <div id="chat-self" className='text-light px-1'>{chat?.text}</div>
            </div>
        </div>
    </div>
  )
}

export default memo(Chat);