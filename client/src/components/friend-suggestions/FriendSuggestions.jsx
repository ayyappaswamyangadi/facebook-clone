import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { PersonAdd, Close } from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import "./friend-suggestions.scss";

const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e4e6e9'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%23bcc0c4'/%3E%3Cellipse cx='20' cy='38' rx='14' ry='10' fill='%23bcc0c4'/%3E%3C/svg%3E";

const FriendSuggestions = () => {
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;
  const [suggestions, setSuggestions] = useState([]);
  const [pendingFollow, setPendingFollow] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/users/suggestions/" + currentUser._id);
        setSuggestions(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetch();
  }, [currentUser._id]);

  const handleFollow = async (targetId, targetName) => {
    setPendingFollow((prev) => ({ ...prev, [targetId]: true }));
    try {
      await axios.put("/users/" + targetId + "/follow", {
        userId: currentUser._id,
      });
      dispatch({ type: "FOLLOW", payload: targetId });
      // Create follow notification
      await axios.post("/notifications", {
        userId: targetId,
        senderId: currentUser._id,
        type: "follow",
      });
      socket?.emit("sendNotification", {
        senderId: currentUser._id,
        receiverId: targetId,
        type: "follow",
      });
      // Remove from suggestions
      setSuggestions((prev) => prev.filter((u) => u._id !== targetId));
    } catch (err) {
      console.log(err);
    } finally {
      setPendingFollow((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const handleDismiss = (targetId) => {
    setSuggestions((prev) => prev.filter((u) => u._id !== targetId));
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="suggestions-container">
      <h4 className="suggestions-title">People You May Know</h4>
      <div className="suggestions-list">
        {suggestions.map((s) => (
          <div key={s._id} className="suggestion-item">
            <button
              className="suggestion-dismiss"
              onClick={() => handleDismiss(s._id)}
              title="Dismiss"
            >
              <Close fontSize="inherit" />
            </button>
            <Link to={`/profile/${s.userName}`} className="suggestion-avatar-link">
              <img
                src={
                  s.profilePicture
                    ? (s.profilePicture.startsWith('http') ? s.profilePicture : public_folder + "profiles/" + s.profilePicture)
                    : PLACEHOLDER_AVATAR
                }
                alt={s.userName}
                className="suggestion-avatar"
                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_AVATAR; }}
              />
            </Link>
            <Link
              to={`/profile/${s.userName}`}
              className="suggestion-name"
            >
              {s.userName}
            </Link>
            {s.followers?.length > 0 && (
              <span className="suggestion-mutual">
                {s.followers.length} follower
                {s.followers.length !== 1 ? "s" : ""}
              </span>
            )}
            <button
              className="suggestion-follow-btn"
              onClick={() => handleFollow(s._id, s.userName)}
              disabled={pendingFollow[s._id]}
            >
              <PersonAdd fontSize="small" />
              {pendingFollow[s._id] ? "Following…" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendSuggestions;
