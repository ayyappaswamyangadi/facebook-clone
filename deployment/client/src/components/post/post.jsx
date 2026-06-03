import "./post.scss";
import { MoreVert, Delete, Comment as CommentIcon } from "@mui/icons-material";
import { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Comments from "../comments/Comments";

const Post = ({ post }) => {
  const public_folder = process.env.REACT_APP_PUBLIC_FOLDER;
  const { user: currentUser } = useContext(AuthContext);
  const [postUser, setPostUser] = useState({});
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser._id));
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const menuRef = useRef();

  // Fetch post author info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/users?userId=" + post.userId);
        setPostUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, [post.userId]);

  // Fetch comment count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get("/comments/" + post._id);
        setCommentCount(res.data.length);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCount();
  }, [post._id]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const likeHandler = async () => {
    try {
      await axios.put("/post/" + post._id + "/like", {
        userId: currentUser._id,
      });
      // Create like notification for post owner
      if (post.userId !== currentUser._id) {
        await axios.post("/notifications", {
          userId: post.userId,
          senderId: currentUser._id,
          type: "like",
          postId: post._id,
        });
      }
    } catch (err) {
      console.log(err);
    }
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  const handleDelete = async () => {
    try {
      await axios.delete("/post/" + post._id, {
        data: { userId: currentUser._id },
      });
      setDeleted(true);
    } catch (err) {
      console.log(err);
    }
    setShowMenu(false);
  };

  const imgSrc = () => {
    if (!post.img) return null;
    // Support both old (root images/) and new format
    return public_folder + post.img;
  };

  if (deleted) return null;

  return (
    <div className="post">
      <div className="post-wrapper">
        {/* Top */}
        <div className="post-top">
          <div className="post-top-left">
            <Link to={`/profile/${postUser.userName}`} className="post-links">
              <img
                src={
                  postUser.profilePicture
                    ? public_folder + "profiles/" + postUser.profilePicture
                    : public_folder + "profiles/no-avatar.png"
                }
                alt="profile"
                className="post-profile-img"
              />
            </Link>
            <div className="post-user-info">
              <div className="post-user-meta">
                <Link to={`/profile/${postUser.userName}`} className="post-links">
                  <span className="post-user-name">{postUser.userName}</span>
                </Link>
                {post.feeling && (
                  <span className="post-feeling-text"> is feeling {post.feeling}</span>
                )}
                {post.tag && (
                  <span className="post-tag-text"> — with {post.tag}</span>
                )}
                {post.location && (
                  <span className="post-location-text"> 📍 {post.location}</span>
                )}
              </div>
              <span className="post-date">
                {moment.parseZone(post.createdAt).fromNow()}
              </span>
            </div>
          </div>

          {/* Options menu */}
          {post.userId === currentUser._id && (
            <div className="post-top-right post-menu-wrapper" ref={menuRef}>
              <MoreVert
                className="post-more-btn"
                onClick={() => setShowMenu((p) => !p)}
              />
              {showMenu && (
                <div className="post-dropdown-menu">
                  <button
                    className="post-dropdown-item delete"
                    onClick={handleDelete}
                  >
                    <Delete fontSize="small" />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="post-center">
          {post.desc && <span className="post-text">{post.desc}</span>}
          {imgSrc() && (
            <img src={imgSrc()} alt="post content" className="post-img" />
          )}
        </div>

        {/* Reactions row */}
        <div className="post-bottom">
          <div className="post-bottom-left">
            <img
              src={`${public_folder}like.png`}
              alt="like"
              className={`like-img ${isLiked ? "liked" : ""}`}
              onClick={likeHandler}
            />
            <img
              src={`${public_folder}heart.png`}
              alt="heart"
              className="heart-img"
              onClick={likeHandler}
            />
            <span className="post-like-counter">
              {like > 0
                ? `${like} ${like === 1 ? "person" : "people"} like this`
                : "Be the first to like"}
            </span>
          </div>
          <div className="post-bottom-right">
            <button
              className="post-comment-text"
              onClick={() => setShowComments((p) => !p)}
            >
              <CommentIcon fontSize="inherit" style={{ marginRight: 4 }} />
              {commentCount} {commentCount === 1 ? "comment" : "comments"}
            </button>
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <Comments
            postId={post._id}
            postOwnerId={post.userId}
            onCommentAdded={() => setCommentCount((c) => c + 1)}
          />
        )}
      </div>
    </div>
  );
};

export default Post;
