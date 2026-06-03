import { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { Link } from "react-router-dom";
import { ThumbUp, Comment, PersonAdd, Close, NotificationsNone } from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import "./notifications.scss";

const NotificationsDropdown = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;
  const [notifications, setNotifications] = useState([]);
  const [senderMap, setSenderMap] = useState({});
  const ref = useRef();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/notifications/" + user._id);
        setNotifications(res.data);

        // Mark all as read
        await axios.put("/notifications/" + user._id + "/read-all");

        // Fetch sender info
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
      }
    };
    fetchNotifications();
  }, [user._id]);

  // Close on outside click
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

  return (
    <div className="notif-dropdown" ref={ref}>
      <div className="notif-header">
        <h3>Notifications</h3>
        <button onClick={onClose}>
          <Close fontSize="small" />
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="notif-empty">
          <NotificationsNone style={{ fontSize: 48, color: "#bcc0c4" }} />
          <p>No notifications yet</p>
        </div>
      ) : (
        <ul className="notif-list">
          {notifications.map((notif) => {
            const sender = senderMap[notif.senderId];
            return (
              <li
                key={notif._id}
                className={`notif-item ${!notif.read ? "unread" : ""}`}
              >
                <Link
                  to={`/profile/${sender?.userName || ""}`}
                  onClick={onClose}
                  className="notif-avatar-link"
                >
                  <div className="notif-avatar-wrapper">
                    <img
                      src={
                        sender?.profilePicture
                          ? public_folder + "profiles/" + sender.profilePicture
                          : public_folder + "profiles/no-avatar.png"
                      }
                      alt={sender?.userName}
                      className="notif-avatar"
                    />
                    {typeIcon(notif.type)}
                  </div>
                </Link>
                <div className="notif-content">
                  <p className="notif-text">
                    {typeText(notif.type, sender?.userName || "Someone")}
                  </p>
                  <span className="notif-time">
                    {moment(notif.createdAt).fromNow()}
                  </span>
                </div>
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
