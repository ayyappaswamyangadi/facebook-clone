import axios from "axios"
import { useEffect, useState } from "react"
import "./chat-online.scss"

const ChatOnline = ({ onlineUsers, currentId, setCurrentChat, setConversations }) => {
    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER;

    const [friends, setFriends] = useState([])
    const [onlineFriends, setOnlineFriends] = useState([])

    useEffect(() => {
        const getFriends = async () => {
            try {
                const response = await axios.get("/users/friends/" + currentId)
                setFriends(response.data)
            } catch (err) {
                console.log(err)
            }
        }
        getFriends()
    }, [currentId])


    useEffect(() => {
        setOnlineFriends(friends.filter(friend => onlineUsers.includes(friend._id)))
    }, [friends, onlineUsers])

    const handleClick = async (friend) => {
        try {
            // Try to find existing conversation
            const res = await axios.get("/conversations/find/" + currentId + "/" + friend._id)

            if (res.data) {
                // Conversation exists — open it
                setCurrentChat(res.data)
            } else {
                // No conversation yet — create one
                const newConvRes = await axios.post("/conversations", {
                    senderId: currentId,
                    receiverId: friend._id,
                })
                setCurrentChat(newConvRes.data)
                // Add to the conversation list in the parent
                if (setConversations) {
                    setConversations(prev => {
                        if (prev.find(c => c._id === newConvRes.data._id)) return prev
                        return [newConvRes.data, ...prev]
                    })
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="chat-online">
            {onlineFriends.length === 0 && (
                <p className="chat-online-empty">No friends online right now</p>
            )}
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
