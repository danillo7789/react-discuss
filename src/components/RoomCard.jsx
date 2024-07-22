import moment from "moment"
import { Link } from "react-router-dom"

const RoomCard = ({ room }) => {
    const blank_img = import.meta.env.VITE_BLANK_IMG;

  return (
    <div className="my-3 px-4 pt-4 pb-3 bg-elements border border-0 rounded-3">
        <div className="d-flex justify-content-between mb-2">
            <div className="d-flex">
                <img className="rounded-circle me-2 display-pic" src={room?.host?.profilePicture?.url || blank_img} alt="display picture" />
                <small className="dim pt-2">@{room?.host?.username}</small>
            </div>
            <div className="pt-2">{moment(room?.createdAt).fromNow()}</div>
        </div>

        <Link className="linkc text-capitalize mb-5" to={`/room/${room?._id}`}><h5 className="room-name">{room?.name}</h5></Link>
        <hr className="divider bg-element-light" />
        <div className="d-flex justify-content-between">
            <small>{room?.participants?.length} Joined</small>
            <small className="border border-0 bg-element-light rounded-pill px-2 py-1 text-capitalize">{room?.topic?.name}</small>
        </div>
    </div>
  )
}

export default RoomCard