import { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import ChatOnline from "../../components/chat-online/ChatOnline";
import { AuthContext } from "../../components/context/AuthContext";
import Conversations from "../../components/conversations/Conversations";
import Message from "../../components/message/Message";
import Topbar from "../../components/topbar/Topbar";
import { Send, EmojiEmotions, Edit, ArrowBack } from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import "./messenger.scss";
import axios from "axios";
import { io } from "socket.io-client";

const Messenger = () => {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allFriends, setAllFriends] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socket = useRef(null);
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);
  const emojiPickerRef = useRef(null);
  const { user } = useContext(AuthContext);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Setup socket
  useEffect(() => {
    socket.current = io("ws://localhost:8900");

    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.userId,
        text: data.text,
        createdAt: Date.now(),
      });
    });

    socket.current.on("typingIndicator", ({ userId }) => {
      if (userId !== user._id) {
        setPeerTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setPeerTyping(false), 3000);
      }
    });

    socket.current.on("stopTyping", ({ userId }) => {
      if (userId !== user._id) setPeerTyping(false);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [user._id]);

  // Register user in socket
  useEffect(() => {
    if (!socket.current) return;
    socket.current.emit("addUser", user._id);
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(
        user.following.filter((id) => users.some((u) => u.userId === id))
      );
    });
  }, [user]);

  // Receive messages
  useEffect(() => {
    if (
      arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender)
    ) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  // Load conversations
  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("/conversations/" + user._id);
        setConversations(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user]);

  // Load all friends for "New Chat" panel
  useEffect(() => {
    const getFriends = async () => {
      try {
        const res = await axios.get("/users/friends/" + user._id);
        setAllFriends(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getFriends();
  }, [user._id]);

  // Start or open a conversation with any friend
  const startConversation = async (friend) => {
    try {
      const res = await axios.get("/conversations/find/" + user._id + "/" + friend._id);
      if (res.data) {
        setCurrentChat(res.data);
      } else {
        const newConvRes = await axios.post("/conversations", {
          senderId: user._id,
          receiverId: friend._id,
        });
        setCurrentChat(newConvRes.data);
        setConversations(prev => {
          if (prev.find(c => c._id === newConvRes.data._id)) return prev;
          return [newConvRes.data, ...prev];
        });
      }
      setShowNewChat(false);
      setMobileChatOpen(true);
    } catch (err) {
      console.log(err);
    }
  };

  // Load messages when chat changes
  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat?._id) return;
      try {
        const res = await axios.get("/messages/" + currentChat._id);
        setMessages(res.data);
        setPeerTyping(false);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping]);

  // Handle typing events
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket.current || !currentChat) return;

    const receiverId = currentChat.members.find((id) => id !== user._id);
    if (!isTyping) {
      setIsTyping(true);
      socket.current.emit("typing", { userId: user._id, receiverId });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      socket.current.emit("stopTyping", { userId: user._id, receiverId });
    }, 2000);
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;

    const messageData = {
      sender: user._id,
      text: newMessage.trim(),
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find((id) => id !== user._id);

    socket.current.emit("sendMessage", {
      userId: user._id,
      receiverId,
      text: newMessage.trim(),
    });

    // Stop typing
    setIsTyping(false);
    socket.current.emit("stopTyping", { userId: user._id, receiverId });

    try {
      const res = await axios.post("/messages", messageData);
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");

      // Create message notification
      await axios.post("/notifications", {
        userId: receiverId,
        senderId: user._id,
        type: "message",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    return true;
  });

  return (
    <>
      <Topbar />
      <div className={`messenger${mobileChatOpen ? " mobile-chat-open" : ""}`}>
        {/* Left panel: conversations */}
        <div className="chat-menu">
          <div className="chat-menu-wrapper">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 className="chat-menu-title" style={{ margin: 0 }}>Chats</h2>
              <button
                className="chat-new-btn"
                style={{ width: "auto", margin: 0, padding: "6px 12px" }}
                title="New conversation"
                onClick={() => setShowNewChat((p) => !p)}
              >
                <Edit fontSize="small" style={{ verticalAlign: "middle", marginRight: 4 }} />
                New
              </button>
            </div>
            <input
              type="text"
              placeholder="Search conversations…"
              className="chat-menu-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {showNewChat && allFriends.length > 0 && (
              <div className="chat-start-list">
                <h4>Start a conversation with:</h4>
                {allFriends
                  .filter(f => !searchQuery.trim() || f.userName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(friend => (
                    <div key={friend._id} className="chat-start-item" onClick={() => startConversation(friend)}>
                      <img
                        src={friend.profilePicture
                          ? process.env.REACT_APP_PUBLIC_FOLDER + "profiles/" + friend.profilePicture
                          : process.env.REACT_APP_PUBLIC_FOLDER + "profiles/no-avatar.png"}
                        alt={friend.userName}
                      />
                      <span>{friend.userName}</span>
                    </div>
                  ))}
              </div>
            )}
            {showNewChat && allFriends.length === 0 && (
              <p style={{ fontSize: 13, color: "#65676b", textAlign: "center" }}>
                Follow someone to start chatting!
              </p>
            )}
            <div className="chat-conversation-list">
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`chat-conversation-item ${
                    currentChat?._id === conv._id ? "active" : ""
                  }`}
                  onClick={() => {
                    setCurrentChat(conv);
                    setMobileChatOpen(true);
                  }}
                >
                  <Conversations conversation={conv} currentUser={user} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: chat box */}
        <div className="chat-box">
          <div className="chat-box-wrapper">
            {/* Mobile back button — shown via CSS on ≤768px */}
            <button
              className="chat-back-btn"
              onClick={() => setMobileChatOpen(false)}
              aria-label="Back to conversations"
            >
              <ArrowBack fontSize="small" />
              Chats
            </button>
            {currentChat ? (
              <>
                <div className="chat-box-top">
                  {messages.map((msg) => (
                    <div
                      key={msg._id || msg.createdAt}
                      ref={scrollRef}
                    >
                      <Message
                        message={msg}
                        own={msg.sender === user._id}
                      />
                    </div>
                  ))}
                  {peerTyping && (
                    <div ref={scrollRef} className="chat-typing-indicator">
                      <span />
                      <span />
                      <span />
                    </div>
                  )}
                </div>

                <form className="chat-box-bottom" onSubmit={handleSend}>
                  {/* Emoji Picker */}
                  <div className="chat-emoji-wrapper" ref={emojiPickerRef}>
                    <button
                      type="button"
                      className={`chat-emoji-btn${showEmojiPicker ? " active" : ""}`}
                      title="Add emoji"
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                    >
                      <EmojiEmotions />
                    </button>
                    {showEmojiPicker && (
                      <div className="chat-emoji-picker">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          width={320}
                          height={400}
                          searchPlaceholder="Search emoji…"
                          previewConfig={{ showPreview: false }}
                        />
                      </div>
                    )}
                  </div>
                  <textarea
                    placeholder="Write a message… (Enter to send)"
                    className="chat-message-input"
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    value={newMessage}
                    rows={1}
                  />
                  <button
                    type="submit"
                    className="chat-box-button"
                    disabled={!newMessage.trim()}
                  >
                    <Send />
                  </button>
                </form>
              </>
            ) : (
              <span className="no-conversation">
                Select a conversation to start chatting
              </span>
            )}
          </div>
        </div>

        {/* Right panel: online friends */}
        <div className="chat-online">
          <div className="chat-online-wrapper">
            <h3 className="chat-online-title">Online</h3>
            <ChatOnline
              onlineUsers={onlineUsers}
              currentId={user._id}
              setCurrentChat={setCurrentChat}
              setConversations={setConversations}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Messenger;
