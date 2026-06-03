import Post from "../post/post";
import Share from "../share-component/Share";
import Stories from "../stories/Stories";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./news-feed.scss";

const NewsFeed = ({ userName }) => {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = userName
        ? await axios.get("/post/profile/" + userName)
        : await axios.get("/post/timeline/" + user._id);
      setPosts(
        response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    };
    fetchPosts();
  }, [userName, user._id]);

  const handleDelete = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  return (
    <div className="news-feed">
      <div className="news-feed-wrapper">
        {(!userName || userName === user.userName) && <Stories />}
        {(!userName || userName === user.userName) && <Share />}
        {posts.length > 0 ? (
          posts.map((post) => (
            <Post key={post._id} post={post} onDelete={handleDelete} />
          ))
        ) : (
          <center>No posts yet</center>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
