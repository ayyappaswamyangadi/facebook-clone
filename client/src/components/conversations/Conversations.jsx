import axios from "axios"
import { useEffect, useState } from "react"
import "./conversation.scss"

const Conversations = ({ conversation, currentUser }) => {
    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER;

    const [user, setUser] = useState(null);



    useEffect(() => {
        const friendId = conversation.members.find((messageId) => messageId !== currentUser._id);
        const getUser = async () => {
            try {
                const response = await axios("/users?userId=" + friendId)
                setUser(response.data)
            }
            catch (error) {
                console.log(error)
            }
        }
        getUser()
    }, [currentUser, conversation])
    return (
        <div className="conversation">
            <img src={user?.profilePicture ? (user.profilePicture.startsWith('http') ? user.profilePicture : public_folder_path + "profiles/" + user.profilePicture) : public_folder_path + "profiles/no-avatar.png"} alt={user?.userName || "friend"} className="conversation-image" />
            <span className="conversation-name">{user?.userName}</span>
        </div>
    )
}
export default Conversations

//{user.profilePicture ? public_folder_path + "profiles/" + user.profilePicture : public_folder_path + "profiles/no-avatar.png"}