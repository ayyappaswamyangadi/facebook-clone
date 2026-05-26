import { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import ChatOnline from "../../components/chat-online/ChatOnline";
import { AuthContext } from "../../components/context/AuthContext";
import Conversations from "../../components/conversations/Conversations";
import Message from "../../components/message/Message";
import Topbar from "../../components/topbar/Topbar";
import "./messenger.scss";
import axios from "axios";
import { io } from "socket.io-client"

const Messenger = () => {
    const [conversations, setConversation] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([])
    const socket = useRef()
    const scrollRef = useRef()
    const { user } = useContext(AuthContext);

    useEffect(() => {
        socket.current = io("ws://localhost:8900")
        socket.current.on("getMessage", data => {
            setArrivalMessage({
                sender: data.userId,
                text: data.text,
                createdAt: Date.now()
            })
        })
    }, [])

    useEffect(() => {
        arrivalMessage && currentChat?.members.includes(arrivalMessage.sender) && setMessages(prev => [...prev, arrivalMessage])
    }, [arrivalMessage, currentChat])

    useEffect(() => {
        if (!socket.current) return;
        socket.current.emit("addUser", user._id)
        socket.current.on("getUsers", users => {
            setOnlineUsers(user.following.filter((friend) => users.some((u) => u.userId === friend)))
        })
    }, [user])

    useEffect(() => {
        const getConversations = async () => {
            try {
                const response = await axios.get("/conversations/" + user._id);
                setConversation(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        getConversations();
    }, [user]);

    useEffect(() => {
        const getMessages = async () => {
            try {
                const response = await axios.get("/messages/" + currentChat?._id)
                setMessages(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        getMessages()
    }, [currentChat])

    const handleClick = async (event) => {
        event.preventDefault();
        const message = {
            sender: user._id,
            text: newMessage,
            conversationId: currentChat._id
        }

        const receiverId = currentChat.members.find(memberId => memberId !== user._id)

        socket.current.emit("sendMessage", {
            userId: user._id,
            receiverId,
            text: newMessage
        });

        try {
            const response = await axios.post("/messages", message);
            setMessages([...messages, response.data])
            setNewMessage("")
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])


    return (
        <>
            <Topbar />
            <div className="messenger">
                <div className="chat-menu">
                    <div className="chat-menu-wrapper">
                        <input
                            type="text"
                            placeholder="Search for friends"
                            className="chat-menu-input"
                        />
                        {conversations.map((conversation) => (
                            <div key={conversation._id} onClick={() => {
                                setCurrentChat(conversation)
                            }}>
                                <Conversations
                                    conversation={conversation}
                                    currentUser={user}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chat-box">
                    <div className="chat-box-wrapper">
                        {currentChat ?
                            (<>
                                <div className="chat-box-top">
                                    {messages.map((message) => (
                                        <div key={message._id || message.createdAt} ref={scrollRef}>
                                            <Message message={message} own={message.sender === user._id} />
                                        </div>
                                    ))}

                                </div>
                                <div className="chat-box-bottom">
                                    <textarea
                                        placeholder="write something...!"
                                        className="chat-message-input" onChange={(event) => setNewMessage(event.target.value)} value={newMessage}
                                    ></textarea>
                                    <button className="chat-box-button" onClick={handleClick}>send</button>
                                </div></>) : (<span className="no-conversation">Open a conversation to start a chat</span>)
                        }
                    </div>
                </div>
                <div className="chat-online">
                    <div className="chat-online-wrapper">
                        <ChatOnline onlineUsers={onlineUsers} currentId={user._id} setCurrentChat={setCurrentChat} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Messenger;
