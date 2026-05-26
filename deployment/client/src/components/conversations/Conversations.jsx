import axios from "axios";
import { useEffect, useState } from "react";
import "./conversation.scss";

const Conversations = ({ conversation, currentUser }) => {
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;
  const [friend, setFriend] = useState(null);

  useEffect(() => {
    const friendId = conversation.members.find(
      (id) => id !== currentUser._id
    );
    if (!friendId) return;

    const getUser = async () => {
      try {
        const res = await axios.get("/users?userId=" + friendId);
        setFriend(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentUser, conversation]);

  return (
    <div className="conversation">
      <div className="conversation-avatar-wrapper">
        <img
          src={
            friend?.profilePicture
              ? public_folder + "profiles/" + friend.profilePicture
              : public_folder + "profiles/no-avatar.png"
          }
          alt={friend?.userName || "user"}
          className="conversation-image"
        />
      </div>
      <div className="conversation-info">
        <span className="conversation-name">{friend?.userName || "…"}</span>
        <span className="conversation-desc">
          {friend?.desc || "Say hello!"}
        </span>
      </div>
    </div>
  );
};

export default Conversations;
