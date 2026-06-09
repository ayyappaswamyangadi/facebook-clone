import OnlineFriend from "../online/OnlineFriend"
import axios from "axios"
import { useContext, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { Add, Remove, LocationOn, Home, Favorite, People, Chat } from "@mui/icons-material"
import { RightBarSkeleton } from "../loaders/Loaders"
import "./right-bar.scss"

const PF = process.env.REACT_APP_PUBLIC_FOLDER;
const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e4e6e9'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%23bcc0c4'/%3E%3Cellipse cx='20' cy='38' rx='14' ry='10' fill='%23bcc0c4'/%3E%3C/svg%3E";

const RELATIONSHIP_MAP = {
    1: "Single",
    2: "In a relationship",
    3: "Married",
};

const RightBar = ({ user }) => {
    const { user: currentUser, dispatch } = useContext(AuthContext)
    const navigate = useNavigate()

    const [friends, setFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [onlineFriends, setOnlineFriends] = useState([]);
    const [loadingOnline, setLoadingOnline] = useState(false);
    const [followed, setFollowed] = useState(currentUser.following.includes(user?._id))
    const [messageError, setMessageError] = useState("")

    useEffect(() => {
        if (!user?._id) return;
        const getFriends = async () => {
            setLoadingFriends(true);
            try {
                const friendList = await axios.get("/users/friends/" + user._id);
                setFriends(friendList.data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoadingFriends(false);
            }
        }
        getFriends()
    }, [user])

    useEffect(() => {
        if (user?._id) return;
        const getOnlineFriends = async () => {
            setLoadingOnline(true);
            try {
                const res = await axios.get("/users/friends/" + currentUser._id);
                setOnlineFriends(res.data.slice(0, 10));
            } catch (err) {
                console.log(err);
            } finally {
                setLoadingOnline(false);
            }
        };
        getOnlineFriends();
    }, [currentUser._id, user]);

    // Sync followed state when navigating to a different profile
    useEffect(() => {
        if (user?._id) {
            setFollowed(currentUser.following.includes(user._id))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id])

    // True if the profile user follows the current user (check profile user's following list)
    const theyFollowMe = user?.following?.some(id => String(id) === String(currentUser._id))

    // True only when both users follow each other
    const isMutual = followed && theyFollowMe


    const handleClick = async () => {
        try {
            if (followed) {
                await axios.put("/users/" + user._id + "/unfollow", { userId: currentUser._id })
                dispatch({ type: "UNFOLLOW", payload: user._id })
            } else {
                await axios.put("/users/" + user._id + "/follow", { userId: currentUser._id })
                dispatch({ type: "FOLLOW", payload: user._id })
            }
            setFollowed(prev => !prev)
        } catch (err) {
            console.log(err);
        }
    }

    const handleMessage = async () => {
        if (!isMutual) {
            setMessageError("Both users must follow each other to message.")
            setTimeout(() => setMessageError(""), 3500)
            return
        }
        try {
            const res = await axios.get(`/conversations/find/${currentUser._id}/${user._id}`)
            let conversation = res.data
            if (!conversation) {
                const newConv = await axios.post("/conversations", {
                    senderId: currentUser._id,
                    receiverId: user._id,
                })
                conversation = newConv.data
            }
            navigate("/messenger", { state: { conversationId: conversation._id } })
        } catch (err) {
            console.log(err)
        }
    }

    const HomeRightBar = () => {
        return (
            <>
                <h4 className="right-bar-title">Online Friends</h4>
                <ul className="right-bar-friend-list">
                    {loadingOnline ? (
                        <RightBarSkeleton count={4} />
                    ) : onlineFriends.length === 0 ? (
                        <li className="right-bar-no-friends">No friends yet</li>
                    ) : (
                        onlineFriends.map(friend => (
                            <OnlineFriend key={friend._id} user={friend} />
                        ))
                    )}
                </ul>
            </>
        )
    }

    const ProfileRightBar = () => {
        const relationshipText = user.relationship
            ? RELATIONSHIP_MAP[user.relationship] || String(user.relationship)
            : null;

        return (
            <>
                {user.userName !== currentUser.userName && (
                    <div className="right-bar-action-buttons">
                        <button className="right-bar-follow-button" onClick={handleClick}>
                            {followed ? "Unfollow" : theyFollowMe ? "Follow Back" : "Follow"} {followed ? <Remove /> : <Add />}
                        </button>
                        {followed && (
                            <button className="right-bar-message-button" onClick={handleMessage}>
                                <Chat fontSize="small" /> Message
                            </button>
                        )}
                    </div>
                )}
                {messageError && (
                    <p className="right-bar-message-error">{messageError}</p>
                )}
                <h4 className="right-bar-title">User Information</h4>
                <div className="right-bar-info">
                    {user.city && (
                        <div className="right-bar-info-item">
                            <LocationOn className="right-bar-info-icon" />
                            <div className="right-bar-info-text">
                                <span className="right-bar-info-key">City</span>
                                <span className="right-bar-info-value">{user.city}</span>
                            </div>
                        </div>
                    )}
                    {user.from && (
                        <div className="right-bar-info-item">
                            <Home className="right-bar-info-icon" />
                            <div className="right-bar-info-text">
                                <span className="right-bar-info-key">From</span>
                                <span className="right-bar-info-value">{user.from}</span>
                            </div>
                        </div>
                    )}
                    {relationshipText && (
                        <div className="right-bar-info-item">
                            <Favorite className="right-bar-info-icon" />
                            <div className="right-bar-info-text">
                                <span className="right-bar-info-key">Relationship</span>
                                <span className="right-bar-info-value">{relationshipText}</span>
                            </div>
                        </div>
                    )}
                    {!user.city && !user.from && !relationshipText && (
                        <p className="right-bar-info-empty">No information added yet.</p>
                    )}
                </div>
                <h4 className="right-bar-title">
                    <People style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }} />
                    Following
                </h4>
                {loadingFriends ? (
                    <RightBarSkeleton count={4} />
                ) : friends.length === 0 ? (
                    <p className="right-bar-info-empty">Not following anyone yet.</p>
                ) : (
                    <div className="right-bar-followings">
                        {friends.map((friend) => (
                            <Link key={friend._id} to={"/profile/" + friend.userName} className="right-bar-following-link">
                                <div className="right-bar-following">
                                    <img
                                        src={friend.profilePicture
                                            ? (friend.profilePicture.startsWith('http') ? friend.profilePicture : PF + "profiles/" + friend.profilePicture)
                                            : PLACEHOLDER_AVATAR}
                                        alt={friend.userName}
                                        className="right-bar-following-img"
                                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_AVATAR; }}
                                    />
                                    <span className="right-bar-following-name">{friend.userName}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </>
        )
    }

    return (
        <div className="right-bar">
            <div className="right-bar-wrapper">
                {user?._id
                    ? <ProfileRightBar key={user._id} />
                    : <HomeRightBar />
                }
            </div>
        </div>
    )
}

export default RightBar
