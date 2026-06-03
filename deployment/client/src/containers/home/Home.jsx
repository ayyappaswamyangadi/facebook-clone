import { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../../components/context/AuthContext";
import NewsFeed from "../../components/news-feed/NewsFeed";
import Sidebar from "../../components/side-bar/Sidebar";
import RightBar from "../../components/right-bar/RightBar";
import Topbar from "../../components/topbar/Topbar";
import "./Home.scss";

const Home = () => {
  const { user } = useContext(AuthContext);
  const socket = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Connect to socket and track online users
  useEffect(() => {
    socket.current = io(process.env.REACT_APP_SOCKET_URL);

    socket.current.emit("addUser", user._id);

    socket.current.on("getUsers", (users) => {
      setOnlineUsers(
        user.following.filter((id) => users.some((u) => u.userId === id))
      );
    });

    return () => {
      socket.current.disconnect();
    };
  }, [user]);

  return (
    <div>
      <Topbar />
      <div className="home-container">
        <Sidebar />
        <NewsFeed />
        <RightBar onlineUsers={onlineUsers} />
      </div>
    </div>
  );
};

export default Home;
