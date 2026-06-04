import { useContext, useEffect, useState } from "react";
import { ThumbUp, Delete, Send } from "@mui/icons-material";
import axios from "axios";
import moment from "moment";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Spinner } from "../loaders/Loaders";
import "./comments.scss";

const Comments = ({ postId, postOwnerId, onLoaded }) => {
  const { user: currentUser } = useContext(AuthContext);
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;

  const [comments, setComments] = useState([]);
  const [commentUsers, setCommentUsers] = useState({});
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(true);

  // Fetch comments for this post
  useEffect(() => {
    const fetchComments = async () => {
      setFetchingComments(true);
      try {
        const res = await axios.get("/comments/" + postId);
        setComments(res.data);
        onLoaded && onLoaded(res.data.length);

        // Resolve user info for each unique userId
        const uniqueIds = [...new Set(res.data.map((c) => c.userId))];
        const userInfos = await Promise.all(
          uniqueIds.map((id) => axios.get("/users?userId=" + id))
        );
        const map = {};
        userInfos.forEach((r) => {
          map[r.data._id] = r.data;
        });
        setCommentUsers(map);
      } catch (err) {
        console.log(err);
      } finally {
        setFetchingComments(false);
      }
    };
    if (postId) fetchComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("/comments", {
        postId,
        userId: currentUser._id,
        text: text.trim(),
      });
      const newComment = res.data;
      setComments((prev) => {
        const updated = [...prev, newComment];
        onLoaded && onLoaded(updated.length);
        return updated;
      });

      // Cache current user info
      setCommentUsers((prev) => ({
        ...prev,
        [currentUser._id]: currentUser,
      }));

      // Create notification for post owner
      if (postOwnerId && postOwnerId !== currentUser._id) {
        await axios.post("/notifications", {
          userId: postOwnerId,
          senderId: currentUser._id,
          type: "comment",
          postId,
        });
      }
      setText("");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId) => {
    try {
      await axios.put("/comments/" + commentId + "/like", {
        userId: currentUser._id,
      });
      setComments((prev) =>
        prev.map((c) => {
          if (c._id !== commentId) return c;
          const liked = c.likes.includes(currentUser._id);
          return {
            ...c,
            likes: liked
              ? c.likes.filter((id) => id !== currentUser._id)
              : [...c.likes, currentUser._id],
          };
        })
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete("/comments/" + commentId, {
        data: { userId: currentUser._id },
      });
      setComments((prev) => {
        const updated = prev.filter((c) => c._id !== commentId);
        onLoaded && onLoaded(updated.length);
        return updated;
      });
    } catch (err) {
      console.log(err);
    }
  };

  const avatarSrc = (userId) => {
    const u = commentUsers[userId];
    if (!u || !u.profilePicture)
      return public_folder + "profiles/no-avatar.png";
    if (u.profilePicture.startsWith("http")) return u.profilePicture;
    return public_folder + "profiles/" + u.profilePicture;
  };

  return (
    <div className="comments-section">
      {/* Comment input */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <img
          src={
            currentUser.profilePicture
              ? (currentUser.profilePicture.startsWith("http") ? currentUser.profilePicture : public_folder + "profiles/" + currentUser.profilePicture)
              : public_folder + "profiles/no-avatar.png"
          }
          alt=""
          className="comment-avatar"
          onError={(e) => { e.target.onerror = null; e.target.src = public_folder + "profiles/no-avatar.png"; }}
        />
        <div className="comment-input-wrapper">
          <input
            type="text"
            className="comment-input"
            placeholder="Write a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="comment-send-btn"
            disabled={loading || !text.trim()}
          >
            <Send fontSize="small" />
          </button>
        </div>
      </form>

      {/* Comment list */}
      <div className="comment-list">
        {fetchingComments ? (
          <Spinner size="sm" />
        ) : comments.map((comment) => {
          const isOwn = comment.userId === currentUser._id;
          const liked = comment.likes.includes(currentUser._id);
          const u = commentUsers[comment.userId];

          return (
            <div key={comment._id} className="comment-item">
              <Link to={`/profile/${u?.userName || ""}`}>
                <img
                  src={avatarSrc(comment.userId)}
                  alt=""
                  className="comment-avatar"
                  onError={(e) => { e.target.onerror = null; e.target.src = public_folder + "profiles/no-avatar.png"; }}
                />
              </Link>
              <div className="comment-body">
                <div className="comment-bubble">
                  <Link
                    to={`/profile/${u?.userName || ""}`}
                    className="comment-username"
                  >
                    {u?.userName || "Unknown"}
                  </Link>
                  <p className="comment-text">{comment.text}</p>
                </div>
                <div className="comment-actions">
                  <span className="comment-time">
                    {moment(comment.createdAt).fromNow()}
                  </span>
                  <button
                    className={`comment-like-btn ${liked ? "liked" : ""}`}
                    onClick={() => handleLike(comment._id)}
                  >
                    <ThumbUp fontSize="inherit" />
                    {comment.likes.length > 0 && (
                      <span>{comment.likes.length}</span>
                    )}
                  </button>
                  {isOwn && (
                    <button
                      className="comment-delete-btn"
                      onClick={() => handleDelete(comment._id)}
                    >
                      <Delete fontSize="inherit" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Comments;
