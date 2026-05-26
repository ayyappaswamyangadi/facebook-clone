const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

/* ── In-memory online users store ─────────────────────────────── */
let users = [];

const addUser = (userId, socketId) => {
  // Don't add duplicates
  if (!users.some((u) => u.userId === userId)) {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((u) => u.userId === userId);
};

/* ── Connection handler ────────────────────────────────────────── */
io.on("connection", (socket) => {
  console.log(`[socket] user connected: ${socket.id}`);

  /* Register user */
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
    console.log(`[socket] user registered: ${userId}`);
  });

  /* Send message (real-time delivery) */
  socket.on("sendMessage", ({ userId, receiverId, text }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", { userId, text });
    }
  });

  /* Typing indicator */
  socket.on("typing", ({ userId, receiverId }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("typingIndicator", { userId });
    }
  });

  /* Stop typing */
  socket.on("stopTyping", ({ userId, receiverId }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("stopTyping", { userId });
    }
  });

  /* Disconnect */
  socket.on("disconnect", () => {
    console.log(`[socket] user disconnected: ${socket.id}`);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
