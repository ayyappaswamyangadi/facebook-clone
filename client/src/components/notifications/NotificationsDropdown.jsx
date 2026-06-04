import { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { Link } from "react-router-dom";
import { ThumbUp, Comment, PersonAdd, Close, NotificationsNone } from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { NotifSkeleton } from "../loaders/Loaders";
import "./notifications.scss";

const NotificationsDropdown = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;
  const [notifications, setNotifications] = useState([]);
  const [senderMap, setSenderMap] = useState({});
  const [loading, setLoading] = useState(true);
  const ref = useRef();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/notifications/" + user._id);
        setNotifications(res.data);

        await axios.put("/notifications/" + user._id + "/read-all");

        const uniqueSenders = [...new Set(res.data.map((n) => n.senderId))];
        const infos = await Promise.all(
          uniqueSenders.map((id) => axios.get("/users?userId=" + id))
        );
        const map = {};
        infos.forEach((r) => {
          map[r.data._id] = r.data;
        });
        setSenderMap(map);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user._id]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const typeIcon = (type) => {
    switch (type) {
      case "like":
        return <ThumbUp className="notif-type-icon notif-like" />;
      case "comment":
        return <Comment className="notif-type-icon notif-comment" />;
      case "follow":
        return <PersonAdd className="notif-type-icon notif-follow" />;
      default:
        return <NotificationsNone className="notif-type-icon" />;
    }
  };

  const typeText = (type, senderName) => {
    switch (type) {
      case "like":
        return `${senderName} liked your post`;
      case "comment":
        return `${senderName} commented on your post`;
      case "follow":
        return `${senderName} started following you`;
      case "message":
        return `${senderName} sent you a message`;
      default:
        return `${senderName} interacted with you`;
    }
  };

  // Navigate to the most relevant destination for each notification type
  const getNotifLink = (notif, sender) => {
    switch (notif.type) {
      case "like":
      case "comment":
        // Navigate to own profile since the post belongs to the current user
        return "/profile/" + user.userName;
      case "follow":
        return "/profile/" + (sender?.userName || "");
      case "message":
        return "/messenger";
      default:
        return "/profile/" + user.userName;
    }
  };

  return (
    <div className="notif-dropdown" ref={ref} onClick={(e) => e.stopPropagation()}>
      <div className="notif-header">
        <h3>Notifications</h3>
        <button onClick={onClose}>
          <Close fontSize="small" />
        </button>
      </div>

      {loading ? (
        <NotifSkeleton count={4} />
      ) : notifications.length === 0 ? (
        <div className="notif-empty">
          <NotificationsNone style={{ fontSize: 48, color: "#bcc0c4" }} />
          <p>No notifications yet</p>
        </div>
      ) : (
        <ul className="notif-list">
          {notifications.map((notif) => {
            const sender = senderMap[notif.senderId];
            const link = getNotifLink(notif, sender);
            return (
              <li
                key={notif._id}
                className={`notif-item ${!notif.read ? "unread" : ""}`}
              >
                <Link
                  to={link}
                  onClick={onClose}
                  className="notif-item-link"
                >
                  <div className="notif-avatar-wrapper">
                    <img
                      src={
                        sender?.profilePicture
                          ? (sender.profilePicture.startsWith("http") ? sender.profilePicture : public_folder + "profiles/" + sender.profilePicture)
                          : public_folder + "profiles/no-avatar.png"
                      }
                      alt=""
                      className="notif-avatar"
                      onError={(e) => { e.target.onerror = null; e.target.src = public_folder + "profiles/no-avatar.png"; }}
                    />
                    {typeIcon(notif.type)}
                  </div>
                  <div className="notif-content">
                    <p className="notif-text">
                      {typeText(notif.type, sender?.userName || "Someone")}
                    </p>
                    <span className="notif-time">
                      {moment(notif.createdAt).fromNow()}
                    </span>
                  </div>
                </Link>
                {!notif.read && <div className="notif-unread-dot" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default NotificationsDropdown;
