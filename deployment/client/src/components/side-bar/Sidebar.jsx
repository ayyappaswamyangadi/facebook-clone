import "./side-bar.scss";
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
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get("/users/friends/" + user._id);
        setFriends(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchFriends();
  }, [user._id]);

  const navItems = [
    { icon: <RssFeed className="side-bar-icon" />, label: "Feed", to: "/" },
    { icon: <Chat className="side-bar-icon" />, label: "Chat", to: "/messenger" },
    {
      icon: <PlayCircleFilledOutlined className="side-bar-icon" />,
      label: "Videos",
      to: "#",
    },
    { icon: <Group className="side-bar-icon" />, label: "Groups", to: "#" },
    { icon: <Bookmark className="side-bar-icon" />, label: "Bookmarks", to: "#" },
    {
      icon: <HelpOutline className="side-bar-icon" />,
      label: "Questions",
      to: "#",
    },
    { icon: <WorkOutline className="side-bar-icon" />, label: "Jobs", to: "#" },
    { icon: <School className="side-bar-icon" />, label: "Courses", to: "#" },
  ];

  return (
    <div className="side-bar">
      <div className="side-bar-wrapper">
        <ul className="side-bar-list">
          {navItems.map((item) => (
            <li key={item.label} className="side-bar-list-item">
              <Link to={item.to} className="side-bar-nav-link">
                {item.icon}
                <span className="side-bar-list-item-text">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <button className="side-bar-button">Show More</button>
        <hr className="side-bar-horizontal-line" />

        {friends.length > 0 && (
          <>
            <p className="side-bar-friends-title">Friends</p>
            <ul className="side-bar-friend-list">
              {friends.map((friend) => (
                <li key={friend._id} className="side-bar-friend-item">
                  <Link
                    to={`/profile/${friend.userName}`}
                    className="side-bar-friend-link"
                  >
                    <div className="side-bar-friend-avatar-wrapper">
                      <img
                        src={
                          friend.profilePicture
                            ? public_folder + "profiles/" + friend.profilePicture
                            : public_folder + "profiles/no-avatar.png"
                        }
                        alt={friend.userName}
                        className="side-bar-friend-img"
                      />
                      <div className="side-bar-online-badge" />
                    </div>
                    <span className="side-bar-friend-name">
                      {friend.userName}
                    </span>
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
