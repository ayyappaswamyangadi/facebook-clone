import './message.scss'
import moment from "moment"

const Message = ({ message, own, senderPicture }) => {
    const fallback = process.env.REACT_APP_PUBLIC_FOLDER + "profiles/no-avatar.png";

    return (
        <div className={own ? "message own" : "message"}>
            <div className="message-top">
                <img
                    src={senderPicture || fallback}
                    alt={own ? "You" : "Friend"}
                    className="message-image"
                />
                <p className="message-text">{message.text}</p>
            </div>
            <div className="message-bottom">
                {moment(message.createdAt).fromNow()}
            </div>
        </div>
    );
};

export default Message;
