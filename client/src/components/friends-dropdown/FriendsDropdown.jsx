import { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Close, PersonAdd, Check, Chat } from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Spinner } from "../loaders/Loaders";
import "./friends-dropdown.scss";

const FO = process.env.REACT_APP_PUBLIC_FOLDER;
const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e4e6e9'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%23bcc0c4'/%3E%3Cellipse cx='20' cy='38' rx='14' ry='10' fill='%23bcc0c4'/%3E%3C/svg%3E";

const avatarSrc = (pic) =>
  pic
    ? pic.startsWith("http") ? pic : FO + "profiles/" + pic
    : PLACEHOLDER_AVATAR;

const FriendsDropdown = ({ onClose }) => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("requests");
  const [followers, setFollowers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [accepting, setAccepting] = useState({});
  const [loading, setLoading] = useState(true);
  const ref = useRef();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [folRes, friRes] = await Promise.all([
          axios.get("/users/followers/" + user._id),
          axios.get("/users/friends/" + user._id),
        ]);
        // "requests" = people following me whom I'm not following back
        setFollowers(
          folRes.data.filter((f) => !user.following.includes(String(f._id)))
        );
        setFriends(friRes.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user._id, user.following]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // True if the friend also follows the current user back
  const isMutual = (friendId) =>
    user.followers?.some(id => String(id) === String(friendId));

  const handleMessageFriend = async (friendId) => {
    try {
      const res = await axios.get(`/conversations/find/${user._id}/${friendId}`);
      let conversation = res.data;
      if (!conversation) {
        const newConv = await axios.post("/conversations", {
          senderId: user._id,
          receiverId: friendId,
        });
        conversation = newConv.data;
      }
      navigate("/messenger", { state: { conversationId: conversation._id } });
      onClose();
    } catch (err) {
      toast.error("Failed to open conversation.");
    }
  };

  const handleAccept = async (follower) => {
    const followerId = String(follower._id);
    setAccepting((p) => ({ ...p, [followerId]: true }));
    try {
      await axios.put("/users/" + followerId + "/follow", {
        userId: user._id,
      });
      dispatch({ type: "FOLLOW", payload: followerId });
      setFollowers((p) => p.filter((f) => String(f._id) !== followerId));
      const res = await axios.get("/users/friends/" + user._id);
      setFriends(res.data);
      toast.success(`You and ${follower.userName} are now friends!`);
    } catch (err) {
      toast.error("Failed to accept request.");
    } finally {
      setAccepting((p) => ({ ...p, [followerId]: false }));
    }
  };

  return (
    <div className="friends-dd" ref={ref} onClick={(e) => e.stopPropagation()}>
      <div className="friends-dd-header">
        <h3>{tab === "requests" ? "Friend Requests" : "Friends"}</h3>
        <button className="friends-dd-close" onClick={onClose}>
          <Close fontSize="small" />
        </button>
      </div>

      <div className="friends-dd-tabs">
        <button
          className={`friends-dd-tab${tab === "requests" ? " active" : ""}`}
          onClick={() => setTab("requests")}
        >
          Requests
          {followers.length > 0 && (
            <span className="friends-dd-badge">{followers.length}</span>
          )}
        </button>
        <button
          className={`friends-dd-tab${tab === "friends" ? " active" : ""}`}
          onClick={() => setTab("friends")}
        >
          Friends
          {friends.length > 0 && (
            <span className="friends-dd-badge friends-dd-badge--gray">
              {friends.length}
            </span>
          )}
        </button>
      </div>

      <div className="friends-dd-body">
        {loading ? (
          <Spinner size="sm" />
        ) : tab === "requests" ? (
          followers.length === 0 ? (
            <div className="friends-dd-empty">
              <PersonAdd style={{ fontSize: 40, color: "#bcc0c4" }} />
              <p>No pending requests</p>
            </div>
          ) : (
            <ul className="friends-dd-list">
              {followers.map((f) => (
                <li key={f._id} className="friends-dd-item">
                  <img
                    src={avatarSrc(f.profilePicture)}
                    alt=""
                    className="friends-dd-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_AVATAR;
                    }}
                  />
                  <div className="friends-dd-info">
                    <span className="friends-dd-name">{f.userName}</span>
                    <button
                      className="friends-dd-accept"
                      disabled={accepting[f._id]}
                      onClick={() => handleAccept(f)}
                    >
                      <Check fontSize="small" />
                      {accepting[f._id] ? "Adding…" : "Follow Back"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : friends.length === 0 ? (
          <div className="friends-dd-empty">
            <PersonAdd style={{ fontSize: 40, color: "#bcc0c4" }} />
            <p>No friends yet</p>
          </div>
        ) : (
          <ul className="friends-dd-list">
            {friends.map((f) => (
              <li key={f._id} className="friends-dd-item">
                <Link
                  to={`/profile/${f.userName}`}
                  className="friends-dd-link"
                  onClick={onClose}
                >
                  <img
                    src={avatarSrc(f.profilePicture)}
                    alt=""
                    className="friends-dd-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_AVATAR;
                    }}
                  />
                  <span className="friends-dd-name">{f.userName}</span>
                </Link>
                {isMutual(f._id) && (
                  <button
                    className="friends-dd-msg"
                    title="Message"
                    onClick={() => handleMessageFriend(String(f._id))}
                  >
                    <Chat fontSize="small" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FriendsDropdown;
