import "./message.scss";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Message = ({ message, own }) => {
  const { user: currentUser } = useContext(AuthContext);
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;
  const [sender, setSender] = useState(null);

  useEffect(() => {
    const fetchSender = async () => {
      if (own) {
        setSender(currentUser);
        return;
      }
      try {
        const res = await axios.get("/users?userId=" + message.sender);
        setSender(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchSender();
  }, [message.sender, own, currentUser]);

  const avatarSrc = () => {
    if (!sender) return public_folder + "profiles/no-avatar.png";
    return sender.profilePicture
      ? public_folder + "profiles/" + sender.profilePicture
      : public_folder + "profiles/no-avatar.png";
  };

  return (
    <div className={own ? "message own" : "message"}>
      <div className="message-top">
        <img
          src={avatarSrc()}
          alt="profile"
          className="message-image"
        />
        <p className="message-text">{message.text}</p>
      </div>
      <div className="message-bottom">
        {moment(message.createdAt).fromNow()}
      </div>
    </div>
  );
};

export default Message;
