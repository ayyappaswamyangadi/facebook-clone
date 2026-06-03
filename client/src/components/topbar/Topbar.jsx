import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Topbar.scss";
import { Search, Person, Chat, Notifications } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import NotificationsDropdown from "../notifications/NotificationsDropdown";
import SearchDropdown from "../search/SearchDropdown";

const Topbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const profileMenuRef = useRef();
  const navigate = useNavigate();

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

  const profilePic = user.profilePicture
    ? user.profilePicture.startsWith("http")
      ? user.profilePicture
      : public_folder_path + "profiles/" + user.profilePicture
    : public_folder_path + "profiles/no-avatar.png";

  return (
    <div className="topBarContainer">
      <div className="topBarLeft">
        <Link className="logo" to="/">
          facebook
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
          <div className="topBarIconItem">
            <Link to={`/profile/${user.userName}`} className="topbar-icon-link">
              <Person />
              <span className="topBarIconBadge">1</span>
            </Link>
          </div>
          <div className="topBarIconItem">
            <Link to="/messenger" className="topbar-icon-link">
              <Chat />
              <span className="topBarIconBadge">13</span>
            </Link>
          </div>
          <div
            className="topBarIconItem"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Notifications />
            <span className="topBarIconBadge">99</span>
            {showNotifications && (
              <NotificationsDropdown onClose={() => setShowNotifications(false)} />
            )}
          </div>
        </div>

        <div className="topBarProfileWrapper" ref={profileMenuRef}>
          <img
            src={profilePic}
            alt="profile"
            className="topBarImg"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          />
          {showProfileMenu && (
            <div className="topBarProfileMenu">
              <Link
                to={`/profile/${user.userName}`}
                className="topBarProfileMenuItem"
                onClick={() => setShowProfileMenu(false)}
              >
                <img src={profilePic} alt="" className="topBarProfileMenuAvatar" />
                <span>{user.userName}</span>
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
