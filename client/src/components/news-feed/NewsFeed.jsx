import Post from "../post/post";
import Share from "../share-component/Share";
import Stories from "../stories/Stories";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { PostSkeleton } from "../loaders/Loaders";
import "./news-feed.scss";

const NewsFeed = ({ userName }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = userName
          ? await axios.get("/post/profile/" + userName)
          : await axios.get("/post/timeline/" + user._id);
        setPosts(
          response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
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
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length > 0 ? (
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
