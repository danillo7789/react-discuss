import moment from "moment";
import { useAuth } from "../authContext/context";
import { memo } from "react";
import { Link } from "react-router-dom";


const Chat = ({ chat, deleteChat, isLoading }) => {
    const { currentUser } = useAuth();
    const blank_img = import.meta.env.VITE_BLANK_IMG;
    // console.log('chats rendered');

  return (
    <div className='border-start border-primary px-3 mb-2 bg-element-light rounded py-3'>
        <div>
            <div className='d-flex justify-content-between'>
                <div className="d-flex f-sm pb-2">
                    <img className="rounded-circle me-2 display-pic" src={chat?.sender?.profilePicture?.url || blank_img} alt="pic" />
                    <Link className="linkc" to={`/profile/${chat?.sender?._id}`}>
                        <small className='dim me-2'>@{chat?.sender?.username}</small>
                    </Link>
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
    </div>
  )
}

export default memo(Chat);