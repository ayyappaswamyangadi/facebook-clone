import "./right-bar.scss";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Add, Remove } from "@mui/icons-material";
import FriendSuggestions from "../friend-suggestions/FriendSuggestions";

const RightBar = ({ user, onlineUsers = [] }) => {
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;

  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [followed, setFollowed] = useState(
    user ? currentUser.following.includes(user._id) : false
  );

  // Fetch user's following list (for profile page)
  useEffect(() => {
    const getFriends = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get("/users/friends/" + user._id);
        setFriends(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getFriends();
  }, [user]);

  // Compute online friends (home page)
  useEffect(() => {
    const getOnlineFriends = async () => {
      if (onlineUsers.length === 0) return;
      try {
        const res = await axios.get("/users/friends/" + currentUser._id);
        setOnlineFriends(
          res.data.filter((f) => onlineUsers.includes(f._id))
        );
      } catch (err) {
        console.log(err);
      }
    };
    getOnlineFriends();
  }, [onlineUsers, currentUser._id]);

  // Update followed state when user prop changes
  useEffect(() => {
    if (user) {
      setFollowed(currentUser.following.includes(user._id));
    }
  }, [user, currentUser.following]);

  const handleFollowToggle = async () => {
    try {
      if (followed) {
        await axios.put("/users/" + user._id + "/unfollow", {
          userId: currentUser._id,
        });
        dispatch({ type: "UNFOLLOW", payload: user._id });
      } else {
        await axios.put("/users/" + user._id + "/follow", {
          userId: currentUser._id,
        });
        dispatch({ type: "FOLLOW", payload: user._id });
        // Notify the followed user
        await axios.post("/notifications", {
          userId: user._id,
          senderId: currentUser._id,
          type: "follow",
        });
      }
      setFollowed(!followed);
    } catch (err) {
      console.log(err);
    }
  };

  const relationshipLabel = (val) => {
    const map = { 1: "Single", 2: "In a relationship", 3: "Married" };
    return map[val] || "—";
  };

  /* ── Profile right bar ── */
  const ProfileRightBar = () => (
    <>
      {user.userName !== currentUser.userName && (
        <button className="right-bar-follow-button" onClick={handleFollowToggle}>
          {followed ? "Unfollow" : "Follow"}
          {followed ? <Remove /> : <Add />}
        </button>
      )}

      <h4 className="right-bar-title">User Information</h4>
      <div className="right-bar-info">
        <div className="right-bar-info-item">
          <span className="right-bar-info-key">City:</span>
          <span className="right-bar-info-value">{user.city || "—"}</span>
        </div>
        <div className="right-bar-info-item">
          <span className="right-bar-info-key">Hometown:</span>
          <span className="right-bar-info-value">{user.from || "—"}</span>
        </div>
        <div className="right-bar-info-item">
          <span className="right-bar-info-key">Relationship:</span>
          <span className="right-bar-info-value">
            {user.relationship ? relationshipLabel(user.relationship) : "—"}
          </span>
        </div>
      </div>

      <h4 className="right-bar-title">Following</h4>
      <div className="right-bar-followings">
        {friends.length === 0 ? (
          <p className="right-bar-no-friends">No following yet</p>
        ) : (
          friends.map((friend) => (
            <Link
              to={"/profile/" + friend.userName}
              key={friend._id}
              className="right-bar-following-link"
            >
              <div className="right-bar-following">
                <img
                  src={
                    friend.profilePicture
                      ? public_folder + "profiles/" + friend.profilePicture
                      : public_folder + "profiles/no-avatar.png"
                  }
                  alt={friend.userName}
                  className="right-bar-following-img"
                />
                <span className="right-bar-following-name">
                  {friend.userName}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );

  /* ── Home right bar ── */
  const HomeRightBar = () => (
    <>
      <div className="birthday-container">
        <img src="/assets/gift.png" alt="" className="birthday-img" />
        <span className="birthday-text">
          <b>Appa</b>, <b>Amma</b> and <b>3 others</b> have their birthday today
        </span>
      </div>

      <img src="/assets/ad.png" alt="ad" className="right-bar-ad" />

      <FriendSuggestions />

      <h4 className="right-bar-title">Online Friends</h4>
      {onlineFriends.length === 0 ? (
        <p className="right-bar-no-friends">No friends currently online</p>
      ) : (
        <ul className="right-bar-friend-list">
          {onlineFriends.map((friend) => (
            <li key={friend._id} className="right-bar-online-item">
              <Link
                to={`/profile/${friend.userName}`}
                className="right-bar-online-link"
              >
                <div className="right-bar-online-avatar-wrapper">
                  <img
                    src={
                      friend.profilePicture
                        ? public_folder + "profiles/" + friend.profilePicture
                        : public_folder + "profiles/no-avatar.png"
                    }
                    alt={friend.userName}
                    className="right-bar-online-img"
                  />
                  <div className="right-bar-online-badge" />
                </div>
                <span className="right-bar-online-name">{friend.userName}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <div className="right-bar">
      <div className="right-bar-wrapper">
        {user?._id ? (
          <ProfileRightBar key="profile-rightbar" />
        ) : (
          <HomeRightBar key="home-rightbar" />
        )}
      </div>
    </div>
  );
};

export default RightBar;
