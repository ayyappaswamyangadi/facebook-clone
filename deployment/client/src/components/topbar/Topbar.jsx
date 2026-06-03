import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Topbar.scss";
import {
  Search,
  Chat,
  Notifications,
  Logout,
  AccountCircle,
  Close,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import NotificationsDropdown from "../notifications/NotificationsDropdown";
import SearchDropdown from "../search/SearchDropdown";

const Topbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;
  const navigate = useNavigate();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef();

  // Poll unread notification count every 30 seconds
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axios.get(
          "/notifications/" + user._id + "/unread-count"
        );
        setUnreadCount(res.data.count);
      } catch (err) {
        // silently fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user._id]);

  // Reset badge when dropdown opens
  useEffect(() => {
    if (showNotifDropdown) setUnreadCount(0);
  }, [showNotifDropdown]);

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (err) {
      // ignore
    }
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <div className="topBarContainer">
      {/* Left */}
      <div className="topBarLeft">
        <Link className="logo" to="/">
          facebook
        </Link>
      </div>

      {/* Center — search */}
      <div className="topBarCenter" style={{ position: "relative" }}>
        <div
          className="searchBar"
          onClick={() => {
            setShowSearchDropdown(true);
            setShowNotifDropdown(false);
            setShowProfileMenu(false);
          }}
        >
          <Search className="searchIcon" />
          <input
            type="text"
            placeholder="Search Facebook"
            className="searchInput"
            readOnly
          />
        </div>
        {showSearchDropdown && (
          <SearchDropdown onClose={() => setShowSearchDropdown(false)} />
        )}
      </div>

      {/* Right */}
      <div className="topBarRight">
        <div className="topBarLinks">
          <Link to="/" className="topBarLink topBarLinkAnchor">Homepage</Link>
          <Link to={`/profile/${user.userName}`} className="topBarLink topBarLinkAnchor">Timeline</Link>
        </div>

        <div className="topBarIcons">
          {/* Chat */}
          <div className="topBarIconItem">
            <Link to="/messenger" className="topbar-icon-link">
              <Chat />
            </Link>
          </div>

          {/* Notifications */}
          <div
            className="topBarIconItem"
            style={{ position: "relative" }}
            onClick={() => {
              setShowNotifDropdown((prev) => !prev);
              setShowSearchDropdown(false);
              setShowProfileMenu(false);
            }}
          >
            <Notifications className="topbar-clickable-icon" />
            {unreadCount > 0 && (
              <span className="topBarIconBadge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
            {showNotifDropdown && (
              <NotificationsDropdown
                onClose={() => setShowNotifDropdown(false)}
              />
            )}
          </div>
        </div>

        {/* Profile avatar + dropdown */}
        <div className="topbar-profile-wrapper" ref={profileMenuRef}>
          <img
            src={
              user.profilePicture
                ? public_folder + "profiles/" + user.profilePicture
                : public_folder + "profiles/no-avatar.png"
            }
            alt="profile"
            className="topBarImg"
            onClick={() => {
              setShowProfileMenu((prev) => !prev);
              setShowNotifDropdown(false);
              setShowSearchDropdown(false);
            }}
          />

          {showProfileMenu && (
            <div className="profile-menu-dropdown">
              <Link
                to={`/profile/${user.userName}`}
                className="profile-menu-item"
                onClick={() => setShowProfileMenu(false)}
              >
                <img
                  src={
                    user.profilePicture
                      ? public_folder + "profiles/" + user.profilePicture
                      : public_folder + "profiles/no-avatar.png"
                  }
                  alt="me"
                  className="profile-menu-avatar"
                />
                <div>
                  <p className="profile-menu-name">{user.userName}</p>
                  <p className="profile-menu-sub">See your profile</p>
                </div>
              </Link>
              <hr className="profile-menu-divider" />
              <button className="profile-menu-item profile-menu-logout" onClick={handleLogout}>
                <div className="profile-menu-icon-circle">
                  <Logout fontSize="small" />
                </div>
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
