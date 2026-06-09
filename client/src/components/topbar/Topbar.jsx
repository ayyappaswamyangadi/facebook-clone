import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Topbar.scss";
import { Search, Chat, Notifications } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import NotificationsDropdown from "../notifications/NotificationsDropdown";
import FriendsDropdown from "../friends-dropdown/FriendsDropdown";
import axios from "axios";

const PF = process.env.REACT_APP_PUBLIC_FOLDER;
const NO_AVATAR = PF + "profiles/no-avatar.png";
const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e4e6e9'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%23bcc0c4'/%3E%3Cellipse cx='20' cy='38' rx='14' ry='10' fill='%23bcc0c4'/%3E%3C/svg%3E";

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

const Topbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDrop, setShowSearchDrop] = useState(false);

  const profileMenuRef = useRef();
  const searchRef = useRef();
  const searchTimer = useRef();
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
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults({ users: [], posts: [] });
      setShowSearchDrop(false);
      return;
    }
    setShowSearchDrop(true);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const [usersRes, postsRes] = await Promise.all([
          axios.get("/users/search?q=" + encodeURIComponent(val.trim())),
          axios.get("/post/search?q=" + encodeURIComponent(val.trim())),
        ]);
        setSearchResults({ users: usersRes.data || [], posts: postsRes.data || [] });
      } catch (err) {
        console.log(err);
        setSearchResults({ users: [], posts: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults({ users: [], posts: [] });
    setShowSearchDrop(false);
  };

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
      : PF + "profiles/" + user.profilePicture
    : NO_AVATAR;

  const hasResults =
    searchResults.users.length > 0 || searchResults.posts.length > 0;

  return (
    <div className="topBarContainer">
      <div className="topBarLeft">
        <Link className="topbar-logo-link" to="/">
          <span className="topbar-logo-text">facebook</span>
          <FbLogo />
        </Link>
      </div>

      <div className="topBarCenter" ref={searchRef}>
        <div className="searchBar">
          <Search className="searchIcon" />
          <input
            type="text"
            placeholder="Search friends, posts…"
            className="searchInput"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim() && setShowSearchDrop(true)}
            autoComplete="off"
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={clearSearch}>✕</button>
          )}
        </div>

        {showSearchDrop && (
          <div className="topbar-search-dropdown">
            {searchLoading && (
              <div className="topbar-search-loading">Searching…</div>
            )}
            {!searchLoading && !hasResults && searchQuery.trim() && (
              <div className="topbar-search-empty">No results for "{searchQuery}"</div>
            )}
            {!searchLoading && searchResults.users.length > 0 && (
              <div className="topbar-search-section">
                <div className="topbar-search-section-title">People</div>
                {searchResults.users.map((u) => (
                  <Link
                    key={u._id}
                    to={`/profile/${u.userName}`}
                    className="topbar-search-item"
                    onClick={clearSearch}
                  >
                    <img
                      src={
                        u.profilePicture
                          ? (u.profilePicture.startsWith("http")
                            ? u.profilePicture
                            : PF + "profiles/" + u.profilePicture)
                          : NO_AVATAR
                      }
                      alt={u.userName}
                      className="topbar-search-avatar"
                      onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_AVATAR; }}
                    />
                    <span className="topbar-search-name">{u.userName}</span>
                  </Link>
                ))}
              </div>
            )}
            {!searchLoading && searchResults.posts.length > 0 && (
              <div className="topbar-search-section">
                <div className="topbar-search-section-title">Posts</div>
                {searchResults.posts.map((p) => (
                  <Link
                    key={p._id}
                    to={p.userName ? `/profile/${p.userName}#post-${p._id}` : "/"}
                    className="topbar-search-item topbar-search-post"
                    onClick={clearSearch}
                  >
                    <svg className="topbar-search-post-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14l4-4h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                    </svg>
                    <span className="topbar-search-post-desc">{p.desc || "(no text)"}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
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
          <div
            className="topBarIconItem"
            onClick={() => {
              setShowFriends((p) => !p);
              setShowNotifications(false);
            }}
          >
            <svg viewBox="0 0 24 24" className="topbar-icon-svg" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            {friendRequestCount > 0 && (
              <span className="topBarIconBadge">{friendRequestCount}</span>
            )}
            {showFriends && (
              <FriendsDropdown onClose={() => setShowFriends(false)} />
            )}
          </div>

          <div className="topBarIconItem">
            <Link to="/messenger" className="topbar-icon-link">
              <Chat />
            </Link>
          </div>

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
            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_AVATAR; }}
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
                  onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_AVATAR; }}
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
