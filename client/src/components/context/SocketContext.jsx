import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) {
      setSocket((prev) => { prev?.disconnect(); return null; });
      setOnlineUsers([]);
      return;
    }

    const s = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:8900", {
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    s.emit("addUser", user._id);
    s.on("connect", () => s.emit("addUser", user._id));
    s.on("getUsers", (users) => setOnlineUsers(users));

    setSocket(s);

    return () => {
      s.off("getUsers");
      s.off("connect");
      s.disconnect();
    };
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
