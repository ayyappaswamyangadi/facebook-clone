import { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import ChatOnline from "../../components/chat-online/ChatOnline";
import { AuthContext } from "../../components/context/AuthContext";
import { SocketContext } from "../../components/context/SocketContext";
import Conversations from "../../components/conversations/Conversations";
import Message from "../../components/message/Message";
import Topbar from "../../components/topbar/Topbar";
import { ConversationSkeleton, Spinner } from "../../components/loaders/Loaders";
import "./messenger.scss";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";

const Messenger = () => {
    const [conversations, setConversation] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [chatPartner, setChatPartner] = useState(null);
    const [chatSearch, setChatSearch] = useState("");
    const [conversationUsers, setConversationUsers] = useState({});
    const scrollRef = useRef();
    const inputRef = useRef();
    const emojiPickerRef = useRef();
    const { user } = useContext(AuthContext);
    const { socket, onlineUsers: socketOnlineUsers } = useContext(SocketContext);
    const onlineUsers = socketOnlineUsers
        .filter((u) => user.following.includes(u.userId))
        .map((u) => u.userId);
    const location = useLocation();
    const public_folder_path = process.env.REACT_APP_PUBLIC_FOLDER;

    useEffect(() => {
        if (!socket) return;
        const handleGetMessage = (data) => {
            setArrivalMessage({
                sender: data.userId,
                text: data.text,
                createdAt: Date.now(),
            });
        };
        socket.on("getMessage", handleGetMessage);
        return () => socket.off("getMessage", handleGetMessage);
    }, [socket]);

    useEffect(() => {
        arrivalMessage &&
            currentChat?.members.includes(arrivalMessage.sender) &&
            setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        const getConversations = async () => {
            setLoadingConversations(true);
            try {
                const response = await axios.get("/conversations/" + user._id);
                const convs = response.data;
                setConversation(convs);
                // Pre-fetch conversation partner names for search
                const userMap = {};
                await Promise.all(
                    convs.map(async (conv) => {
                        const partnerId = conv.members.find(m => m !== user._id);
                        if (partnerId) {
                            try {
                                const res = await axios.get("/users?userId=" + partnerId);
                                userMap[conv._id] = res.data?.userName || "";
                            } catch (e) {}
                        }
                    })
                );
                setConversationUsers(userMap);
            } catch (error) {
                console.log(error);
            } finally {
                setLoadingConversations(false);
            }
        };
        getConversations();
    }, [user]);

    useEffect(() => {
        const getMessages = async () => {
            if (!currentChat) return;
            setLoadingMessages(true);
            try {
                const response = await axios.get("/messages/" + currentChat._id);
                setMessages(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoadingMessages(false);
            }
        };
        getMessages();
    }, [currentChat]);

    useEffect(() => {
        if (!currentChat) return;
        const partnerId = currentChat.members.find((m) => m !== user._id);
        const fetchPartner = async () => {
            try {
                const res = await axios.get("/users?userId=" + partnerId);
                setChatPartner(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchPartner();
    }, [currentChat, user._id]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(e.target)
            ) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const getProfilePic = (u) => {
        if (!u?.profilePicture) return public_folder_path + "profiles/no-avatar.png";
        if (u.profilePicture.startsWith("http")) return u.profilePicture;
        return public_folder_path + "profiles/" + u.profilePicture;
    };

    const onEmojiClick = (emojiData) => {
        const emoji = emojiData.emoji;
        const input = inputRef.current;
        if (!input) {
            setNewMessage((prev) => prev + emoji);
            return;
        }
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const updated =
            newMessage.substring(0, start) + emoji + newMessage.substring(end);
        setNewMessage(updated);
        // Restore cursor position after React re-render
        requestAnimationFrame(() => {
            input.selectionStart = start + emoji.length;
            input.selectionEnd = start + emoji.length;
            input.focus();
        });
    };

    const handleSend = async (event) => {
        event.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            sender: user._id,
            text: newMessage,
            conversationId: currentChat._id,
        };

        const receiverId = currentChat.members.find(
            (memberId) => memberId !== user._id
        );

        socket?.emit("sendMessage", {
            userId: user._id,
            receiverId,
            text: newMessage,
        });

        try {
            const response = await axios.post("/messages", message);
            setMessages((prev) => [...prev, response.data]);
            setNewMessage("");
            setShowEmojiPicker(false);

            // Notify the receiver
            axios.post("/notifications", {
                userId: receiverId,
                senderId: user._id,
                type: "message",
            }).catch(() => {});
        } catch (error) {
            console.log(error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Open a specific conversation when navigated from a profile's Message button
    useEffect(() => {
        const targetConvId = location.state?.conversationId;
        if (!targetConvId || loadingConversations) return;

        const found = conversations.find(c => c._id === targetConvId);
        if (found) {
            setCurrentChat(found);
            return;
        }
        // Conversation was just created — re-fetch the list then open it
        axios.get("/conversations/" + user._id).then(res => {
            setConversation(res.data);
            const conv = res.data.find(c => c._id === targetConvId);
            if (conv) setCurrentChat(conv);
        }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingConversations]);

    return (
        <>
            <Topbar />
            <div className="messenger">
                <div className="chat-menu">
                    <div className="chat-menu-wrapper">
                        <input
                            type="text"
                            placeholder="Search conversations…"
                            className="chat-menu-input"
                            value={chatSearch}
                            onChange={(e) => setChatSearch(e.target.value)}
                        />
                        {loadingConversations ? (
                            <>
                                <ConversationSkeleton />
                                <ConversationSkeleton />
                                <ConversationSkeleton />
                                <ConversationSkeleton />
                            </>
                        ) : (
                            conversations
                                .filter((conv) => {
                                    if (!chatSearch.trim()) return true;
                                    const name = conversationUsers[conv._id] || "";
                                    return name.toLowerCase().includes(chatSearch.toLowerCase());
                                })
                                .map((conversation) => (
                                    <div
                                        key={conversation._id}
                                        onClick={() => setCurrentChat(conversation)}
                                    >
                                        <Conversations
                                            conversation={conversation}
                                            currentUser={user}
                                        />
                                    </div>
                                ))
                        )}
                    </div>
                </div>
                <div className="chat-box">
                    <div className="chat-box-wrapper">
                        {currentChat ? (
                            <>
                                <div className="chat-box-header">
                                    <div className="chat-box-header-info">
                                        {chatPartner && (
                                            <>
                                                <img
                                                    src={getProfilePic(chatPartner)}
                                                    alt=""
                                                    className="chat-box-header-avatar"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = public_folder_path + "profiles/no-avatar.png"; }}
                                                />
                                                <span className="chat-box-header-name">{chatPartner.userName}</span>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        className="chat-box-close-btn"
                                        onClick={() => { setCurrentChat(null); setChatPartner(null); setMessages([]); }}
                                        title="Close chat"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="chat-box-top">
                                    {loadingMessages ? (
                                        <div className="messages-loading">
                                            <Spinner size="md" />
                                            <span>Loading messages…</span>
                                        </div>
                                    ) : (
                                        messages.map((message) => (
                                            <div
                                                ref={scrollRef}
                                                key={message._id || message.createdAt}
                                            >
                                                <Message
                                                    message={message}
                                                    own={message.sender === user._id}
                                                    senderPicture={
                                                        message.sender === user._id
                                                            ? getProfilePic(user)
                                                            : getProfilePic(chatPartner)
                                                    }
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="chat-box-bottom">
                                    <div
                                        className="emoji-picker-container"
                                        ref={emojiPickerRef}
                                    >
                                        <button
                                            className={`emoji-btn${showEmojiPicker ? " active" : ""}`}
                                            type="button"
                                            onClick={() =>
                                                setShowEmojiPicker((v) => !v)
                                            }
                                            title="Emoji"
                                            aria-label="Open emoji picker"
                                        >
                                            😊
                                        </button>
                                        {showEmojiPicker && (
                                            <div className="emoji-picker-popup">
                                                <EmojiPicker
                                                    onEmojiClick={onEmojiClick}
                                                    height={380}
                                                    width={300}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <textarea
                                        ref={inputRef}
                                        placeholder="Write something...!"
                                        className="chat-message-input"
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        value={newMessage}
                                    />
                                    <button
                                        className="chat-box-button"
                                        onClick={handleSend}
                                    >
                                        Send
                                    </button>
                                </div>
                            </>
                        ) : (
                            <span className="no-conversation">
                                Open a conversation to start a chat
                            </span>
                        )}
                    </div>
                </div>
                <div className="chat-online">
                    <div className="chat-online-wrapper">
                        <ChatOnline
                            onlineUsers={onlineUsers}
                            currentId={user._id}
                            setCurrentChat={setCurrentChat}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Messenger;
