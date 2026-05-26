import Post from "../post/post";
import Share from "../share-component/Share";
import Stories from "../stories/Stories";
import { useState, useEffect, useContext } from "react";
import "./news-feed.scss";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const NewsFeed = ({ userName }) => {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = userName
          ? await axios.get("/post/profile/" + userName)
          : await axios.get("/post/timeline/" + user._id);
        setPosts(
          response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    fetchPosts();
  }, [userName, user._id]);

  return (
    <div className="news-feed">
      <div className="news-feed-wrapper">
        {/* Stories bar — only on the home feed */}
        {!userName && <Stories />}

        {/* Create post — only if on home feed or own profile */}
        {(!userName || userName === user.userName) && <Share />}

        {posts.length === 0 ? (
          <div className="news-feed-empty">
            <p>No posts yet. Follow some friends or create your first post!</p>
          </div>
        ) : (
          posts.map((post) => <Post key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
