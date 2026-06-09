import axios from "axios"
import { useEffect, useState } from "react"
import { ConversationSkeleton } from "../loaders/Loaders"
import "./conversation.scss"

const PF = process.env.REACT_APP_PUBLIC_FOLDER;
const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e4e6e9'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%23bcc0c4'/%3E%3Cellipse cx='20' cy='38' rx='14' ry='10' fill='%23bcc0c4'/%3E%3C/svg%3E";

const Conversations = ({ conversation, currentUser }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const friendId = conversation.members.find((messageId) => messageId !== currentUser._id);
        const getUser = async () => {
            setLoading(true);
            try {
                const response = await axios.get("/users?userId=" + friendId)
                setUser(response.data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false);
            }
        }
        getUser()
    }, [currentUser, conversation])

    if (loading) return <ConversationSkeleton />;

    return (
        <div className="conversation">
            <img
                src={user?.profilePicture
                    ? (user.profilePicture.startsWith('http') ? user.profilePicture : PF + "profiles/" + user.profilePicture)
                    : PLACEHOLDER_AVATAR}
                alt={user?.userName || "friend"}
                className="conversation-image"
                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_AVATAR; }}
            />
            <span className="conversation-name">{user?.userName}</span>
        </div>
    )
}
export default Conversations

//{user.profilePicture ? public_folder_path + "profiles/" + user.profilePicture : public_folder_path + "profiles/no-avatar.png"}