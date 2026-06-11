import Post from "../post/post";
import Share from "../share-component/Share";
import Stories from "../stories/Stories";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { PostSkeleton } from "../loaders/Loaders";
import useInView from "../../hooks/useInView";
import "./news-feed.scss";

// Mounts Post only when it scrolls within 300px of the viewport.
// Once mounted it stays mounted so API calls don't repeat on scroll-back.
const LazyPost = ({ post, onDelete, onHide }) => {
  const [ref, inView] = useInView({ rootMargin: "300px 0px" });
  return (
    <div ref={ref}>
      {inView ? (
        <Post post={post} onDelete={onDelete} onHide={onHide} />
      ) : (
        <PostSkeleton />
      )}
    </div>
  );
};

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
          response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        );
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [userName, user._id]);

  useEffect(() => {
    if (
      !loading &&
      posts.length > 0 &&
      window.location.hash.startsWith("#post-")
    ) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, posts]);

  useEffect(() => {
    const onPostCreated = (e) => {
      const newPost = e.detail;
      if (newPost?._id) {
        setPosts((prev) => [newPost, ...prev]);
      }
    };
    window.addEventListener("fb-post-created", onPostCreated);
    return () => window.removeEventListener("fb-post-created", onPostCreated);
  }, []);

  const handleDelete = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handleHide = (hiddenId) => {
    setPosts((prev) => prev.filter((p) => p._id !== hiddenId));
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
            <LazyPost
              key={post._id}
              post={post}
              onDelete={handleDelete}
              onHide={handleHide}
            />
          ))
        ) : (
          <center className="no-posts-yet">No posts yet</center>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
