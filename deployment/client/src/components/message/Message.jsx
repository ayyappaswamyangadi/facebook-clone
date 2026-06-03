import './message.scss'
import moment from "moment"

const Message = ({ message, own }) => {
    return (
        <div className={own ? "message own" : "message"}>
            <div className="message-top">
                <img src="assets/profiles/ayyappaProfile.jpg" alt="profile" className="message-image" />
                <p className='message-text'>{message.text}</p>
            </div>
            <div className="message-bottom">
                {moment(message.createdAt).fromNow()}
            </div>
        </div>
    )
}

export default Message