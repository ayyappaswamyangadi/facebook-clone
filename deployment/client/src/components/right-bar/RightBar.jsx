import OnlineFriend from "../online/OnlineFriend"
import { Users } from "../../dummyData"
import axios from "axios"
import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { Add, Remove } from "@mui/icons-material"
import "./right-bar.scss"

const RightBar = ({ user }) => {
    const { user: currentUser, dispatch } = useContext(AuthContext)
    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER;

    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const getFriends = async () => {
            try {
                const friendList = await axios.get("/users/friends/" + user._id);
                setFriends(friendList.data)
            } catch (error) {
                console.log(error)
            }
        }
        getFriends()
    }, [user])

    const [followed, setFollowed] = useState(currentUser.following.includes(user?.id))

    const handleClick = async () => {
        try {
            if (followed) {
                await axios.put("/users/" + user._id + "/unfollow", { userId: currentUser._id })
                dispatch({ type: "UNFOLLOW", payload: user._id })
            } else {
                await axios.put("/users/" + user._id + "/follow", { userId: currentUser._id })
                dispatch({ type: "FOLLOW", payload: user._id })

            }
        } catch (err) {
            console.log(err);
        }
        setFollowed(!followed)
    }

    const HomeRightBar = () => {
        return (
            <>
                <div className="birthday-container">
                    <img src="/assets/gift.png" alt="" className="birthday-img" />
                    <span className="birthday-text"><b>Appa</b>, <b>Amma</b> and <b>3 others</b> have their birthday today</span>
                </div>
                <img src="/assets/ad.png" alt="" className="right-bar-ad" />
                <h4 className="right-bar-title">Online friends</h4>
                <ul className="right-bar-friend-list">
                    {
                        Users.map(user => (
                            <OnlineFriend key={user.id} user={user} />

                        ))
                    }
                </ul>
            </>

        )
    }

    const ProfileRightBar = () => {
        return (
            <>
                {user.userName !== currentUser.userName && (
                    <button className="right-bar-follow-button" onClick={handleClick}>
                        {followed ? "unfollow" : "follow"} {followed ? <Remove /> : <Add />} </button>
                )}
                <h4 className="right-bar-title">User Information</h4>
                <div className="right-bar-info">
                    <div className="right-bar-info-item">
                        <span className="right-bar-info-key">City:</span>
                        <span className="right-bar-info-value">{user.city}</span>
                    </div>
                    <div className="right-bar-info-item">
                        <span className="right-bar-info-key">From:</span>
                        <span className="right-bar-info-value">{user.from}</span>
                    </div>
                    <div className="right-bar-info-item">
                        <span className="right-bar-info-key">Relationship:</span>
                        <span className="right-bar-info-value">{user.relationship}</span>
                    </div>
                </div>
                <h4 className="right-bar-title">Following</h4>
                <div className="right-bar-followings">
                    {friends.map((friend) =>
                    (
                        <Link to={"/profile/" + friend.userName} className="friendListLink"> <div className="right-bar-following">
                            <img src={friend.profilePicture ? (friend.profilePicture.startsWith('http') ? friend.profilePicture : public_folder_path + "profiles/" + friend.profilePicture) : public_folder_path + "profiles/no-avatar.png"} alt="" className="right-bar-following-img" />
                            <span className="right-bar-following-name">{friend.userName}</span>
                        </div>
                            {console.log("one", friends)}
                            {console.log("friend", friend)}
                        </Link>
                    ))}
                </div>
            </>
        )
    }
    return (
        <div className="right-bar">
            <div className="right-bar-wrapper">
                {user ?
                    <ProfileRightBar key={friends.map((friend) => { return friend._id })} /> : <HomeRightBar key={Users.map((user) => { return user.id })} />
                }
            </div>
        </div>
    )
}

export default RightBar