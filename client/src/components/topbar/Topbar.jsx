import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Topbar.scss";
import { Search, Chat, Notifications } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import NotificationsDropdown from "../notifications/NotificationsDropdown";
import SearchDropdown from "../search/SearchDropdown";
import FriendsDropdown from "../friends-dropdown/FriendsDropdown";
import axios from "axios";

const FbLogo = () => (
  <svg
    className="topbar-svg-logo"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Facebook"
  >
    <circle cx="18" cy="18" r="18" fill="white" />
    <path
      d="M24 18h-4v-2.5c0-.83.67-1.5 1.5-1.5H24V10h-2.5C18.47 10 16 12.47 16 15.5V18h-3v4h3v9h4v-9h3l1-4z"
      fill="#1877f2"
    />
  </svg>
);

const NO_AVATAR = process.env.REACT_APP_PUBLIC_FOLDER + "profiles/no-avatar.png";

const Topbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const profileMenuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [notifRes, followersRes] = await Promise.all([
          axios.get("/notifications/" + user._id + "/unread-count"),
          axios.get("/users/followers/" + user._id),
        ]);
        setNotifCount(notifRes.data.count || 0);
        const requests = followersRes.data.filter(
          (f) => !user.following.includes(String(f._id))
        ).length;
        setFriendRequestCount(requests);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCounts();
  }, [user._id, user.following]);

  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    setShowProfileMenu(false);
    navigate("/login");
  };

  const handleNotifClose = () => {
    setShowNotifications(false);
    setNotifCount(0);
  };

  const profilePic = user.profilePicture
    ? user.profilePicture.startsWith("http")
      ? user.profilePicture
      : public_folder_path + "profiles/" + user.profilePicture
    : NO_AVATAR;

  return (
    <div className="topBarContainer">
      <div className="topBarLeft">
        <Link className="topbar-logo-link" to="/">
          <span className="topbar-logo-text">facebook</span>
          <FbLogo />
        </Link>
      </div>

      <div className="topBarCenter">
        <div className="searchBar" onClick={() => setShowSearch(true)}>
          <Search className="searchIcon" />
          <input
            type="text"
            placeholder="Search for friend, post, video"
            className="searchInput"
            readOnly
          />
        </div>
        {showSearch && <SearchDropdown onClose={() => setShowSearch(false)} />}
      </div>

      <div className="topBarRight">
        <div className="topBarLinks">
          <Link className="topBarLink" to="/">
            Homepage
          </Link>
          <Link className="topBarLink" to={`/profile/${user.userName}`}>
            Timeline
          </Link>
        </div>

        <div className="topBarIcons">
          {/* Friends / requests */}
          <div
            className="topBarIconItem"
            onClick={() => {
              setShowFriends((p) => !p);
              setShowNotifications(false);
            }}
          >
            <svg viewBox="0 0 24 24" className="topbar-icon-svg" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            {friendRequestCount > 0 && (
              <span className="topBarIconBadge">{friendRequestCount}</span>
            )}
            {showFriends && (
              <FriendsDropdown onClose={() => setShowFriends(false)} />
            )}
          </div>

          {/* Messenger */}
          <div className="topBarIconItem">
            <Link to="/messenger" className="topbar-icon-link">
              <Chat />
            </Link>
          </div>

          {/* Notifications */}
          <div
            className="topBarIconItem"
            onClick={() => {
              setShowNotifications((p) => !p);
              setShowFriends(false);
            }}
          >
            <Notifications />
            {notifCount > 0 && (
              <span className="topBarIconBadge">{notifCount > 99 ? "99+" : notifCount}</span>
            )}
            {showNotifications && (
              <NotificationsDropdown onClose={handleNotifClose} />
            )}
          </div>
        </div>

        <div className="topBarProfileWrapper" ref={profileMenuRef}>
          <img
            src={profilePic}
            alt="profile"
            className="topBarImg"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            onError={(e) => { e.target.onerror = null; e.target.src = NO_AVATAR; }}
          />
          {showProfileMenu && (
            <div className="topBarProfileMenu">
              <Link
                to={`/profile/${user.userName}`}
                className="topBarProfileMenuItem"
                onClick={() => setShowProfileMenu(false)}
              >
                <img
                  src={profilePic}
                  alt=""
                  className="topBarProfileMenuAvatar"
                  onError={(e) => { e.target.onerror = null; e.target.src = NO_AVATAR; }}
                />
                <div className="topBarProfileMenuInfo">
                  <span className="topBarProfileMenuName">{user.userName}</span>
                  <span className="topBarProfileMenuSub">View your profile</span>
                </div>
              </Link>
              <hr className="topBarProfileMenuDivider" />
              <button className="topBarProfileMenuLogout" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
