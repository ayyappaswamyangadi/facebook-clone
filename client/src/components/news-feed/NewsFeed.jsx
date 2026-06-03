import Post from "../post/post";
import Share from "../share-component/Share";
// import { Posts } from "../../dummyData";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./news-feed.scss";

const NewsFeed = ({ userName }) => {
  const [post, setPost] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = userName
        ? await axios.get("/post/profile/" + userName)
        : await axios.get("/post/timeline/" + user._id);
      setPost(
        response.data.sort((postOne, postTwo) => {
          return new Date(postTwo.createdAt) - new Date(postOne.createdAt);
        })
      );
    };
    fetchPosts();
  }, [userName, user._id]);
  return (
    <div className="news-feed">
      <div className="news-feed-wrapper">
        {(!userName || userName === user.userName) && <Share />}
        {/* {
          Posts.map((post) => (
            <Post key={post.id} post={post} />
          ))
        } */}
        {post.length > 0 ? (
          post.map((post) => <Post key={post._id} post={post} />)
        ) : (
          <center>No posts yet</center>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
