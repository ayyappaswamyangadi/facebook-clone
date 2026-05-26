import axios from "axios"
import { useEffect, useState } from "react"
import "./chat-online.scss"
const ChatOnline = ({ onlineUsers, currentId, setCurrentChat }) => {
    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER;

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
            const chat = await axios.get("conversations/find/" + currentId + "/" + user._id + "/")
            setCurrentChat(chat.data)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="chat-online">
            {onlineFriends.map((onlineFriend => (
                <div key={onlineFriend._id} className="chat-online-friend" onClick={() => handleClick(onlineFriend)}>
                    <div className="chat-online-image-container">
                        <img src={onlineFriend?.profilePicture ? public_folder_path + "profiles/" + onlineFriend.profilePicture : public_folder_path + "profiles/no-avatar.png"} alt={onlineFriend?.userName} className="chat-online-image" />
                        <div className="chat-online-badge"></div>
                    </div>
                    <span className="chat-online-name">{onlineFriend?.userName}</span>
                </div>
            )))}
        </div>
    )
}

export default ChatOnline
