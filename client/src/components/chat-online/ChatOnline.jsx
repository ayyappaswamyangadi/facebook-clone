import axios from "axios"
import { useEffect, useState } from "react"
import "./chat-online.scss"

const PF = process.env.REACT_APP_PUBLIC_FOLDER;
const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e4e6e9'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%23bcc0c4'/%3E%3Cellipse cx='20' cy='38' rx='14' ry='10' fill='%23bcc0c4'/%3E%3C/svg%3E";

const ChatOnline = ({ onlineUsers, currentId, setCurrentChat }) => {

    const [friends, setFriends] = useState([])
    const [onlineFriends, setOnlineFriends] = useState([])

    useEffect(() => {
        const getFriends = async () => {
            const response = await axios.get("/users/friends/" + currentId)
            setFriends(response.data)
        }
        getFriends()
    }, [currentId])


    useEffect(() => {
        setOnlineFriends(friends.filter(friend => onlineUsers.includes(friend._id)))
    }, [friends, onlineUsers])

    const handleClick = async (user) => {
        try {
            const res = await axios.get("/conversations/find/" + currentId + "/" + user._id)
            if (res.data) {
                setCurrentChat(res.data)
            } else {
                // No conversation exists yet — create one
                const newConv = await axios.post("/conversations", {
                    senderId: currentId,
                    receiverId: user._id,
                })
                setCurrentChat(newConv.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="chat-online">
            {onlineFriends.map((onlineFriend => (

                <div className="chat-online-friend" onClick={() => handleClick(onlineFriend)}>
                    <div className="chat-online-image-container">
                        <img
                            src={onlineFriend?.profilePicture
                                ? (onlineFriend.profilePicture.startsWith('http')
                                    ? onlineFriend.profilePicture
                                    : PF + "profiles/" + onlineFriend.profilePicture)
                                : PLACEHOLDER_AVATAR}
                            alt={onlineFriend?.userName}
                            className="chat-online-image"
                            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_AVATAR; }}
                        />
                        <div className="chat-online-badge"></div>
                    </div>
                    <span className="chat-online-name">{onlineFriend?.userName}</span>
                </div>
            )))}
        </div>
    )
}

export default ChatOnline