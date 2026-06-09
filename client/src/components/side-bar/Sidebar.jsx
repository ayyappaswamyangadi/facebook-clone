import {
    RssFeed,
    Chat,
    PlayCircleFilledOutlined,
    HelpOutline,
    WorkOutline,
    Bookmark,
    Group,
    School,
} from "@mui/icons-material";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import "./side-bar.scss";

const PF = process.env.REACT_APP_PUBLIC_FOLDER;
const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e4e6e9'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%23bcc0c4'/%3E%3Cellipse cx='20' cy='38' rx='14' ry='10' fill='%23bcc0c4'/%3E%3C/svg%3E";

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const getFriends = async () => {
            try {
                const res = await axios.get("/users/friends/" + user._id);
                setFriends(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        getFriends();
    }, [user._id, user.following]);

    return (
        <div className="side-bar">
            <div className="side-bar-wrapper">
                <ul className="side-bar-list">
                    <li className="side-bar-list-item">
                        <RssFeed className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Feed</span>
                    </li>
                    <li className="side-bar-list-item">
                        <Chat className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Chat</span>
                    </li>
                    <li className="side-bar-list-item">
                        <PlayCircleFilledOutlined className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Video</span>
                    </li>
                    <li className="side-bar-list-item">
                        <Group className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Groups</span>
                    </li>
                    <li className="side-bar-list-item">
                        <Bookmark className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Bookmarks</span>
                    </li>
                    <li className="side-bar-list-item">
                        <HelpOutline className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Questions</span>
                    </li>
                    <li className="side-bar-list-item">
                        <WorkOutline className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Jobs</span>
                    </li>
                    <li className="side-bar-list-item">
                        <School className="side-bar-icon" />
                        <span className="side-bar-list-item-text">Courses</span>
                    </li>
                </ul>
                <hr className="side-bar-horizontal-line" />
                {friends.length > 0 && (
                    <>
                        <h5 className="side-bar-friends-title">People you follow</h5>
                        <ul className="side-bar-friend-list">
                            {friends.map(friend => (
                                <li key={friend._id} className="side-bar-friend">
                                    <Link to={`/profile/${friend.userName}`} className="side-bar-friend-link">
                                        <img
                                            src={friend.profilePicture
                                                ? (friend.profilePicture.startsWith('http')
                                                    ? friend.profilePicture
                                                    : PF + "profiles/" + friend.profilePicture)
                                                : PLACEHOLDER_AVATAR}
                                            alt={friend.userName}
                                            className="side-bar-friend-img"
                                            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_AVATAR; }}
                                        />
                                        <span className="side-bar-friend-name">{friend.userName}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
