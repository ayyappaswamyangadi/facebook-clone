require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");

const databaseConnection = require("./database-connection");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const conversationRoutes = require("./routes/conversations");
const messageRoutes = require("./routes/messages");
const commentRoutes = require("./routes/comments");
const storyRoutes = require("./routes/stories");
const notificationRoutes = require("./routes/notifications");

const port = process.env.PORT || 5757;
const app = express();

// Connect to database
databaseConnection();

// Ensure upload directories exist
const uploadDirs = [
  "public/images",
  "public/images/profiles",
  "public/images/covers",
  "public/images/stories",
];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("common"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());

// ── Static files ────────────────────────────────────────────────────────────
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ── File upload helpers ─────────────────────────────────────────────────────
const makeStorage = (dest) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) =>
      cb(null, Date.now() + "_" + file.originalname),
  });

// Generic upload — server generates a unique filename and returns it to the client
const legacyStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) => {
    // Sanitise the original name: remove spaces & special chars
    const safeName = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, Date.now() + "_" + safeName);
  },
});
app.post("/upload", multer({ storage: legacyStorage }).single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json("No file received");
    return res.status(200).json({ filename: req.file.filename });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Profile picture upload  → public/images/profiles/
app.post(
  "/upload/profile",
  multer({ storage: makeStorage("public/images/profiles") }).single("file"),
  (req, res) => {
    try {
      return res.status(200).json({ filename: req.file.filename });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// Cover photo upload → public/images/covers/
app.post(
  "/upload/cover",
  multer({ storage: makeStorage("public/images/covers") }).single("file"),
  (req, res) => {
    try {
      return res.status(200).json({ filename: req.file.filename });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// Story image upload → public/images/stories/
app.post(
  "/upload/story",
  multer({ storage: makeStorage("public/images/stories") }).single("file"),
  (req, res) => {
    try {
      return res.status(200).json({ filename: req.file.filename });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/post", postRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);
app.use("/comments", commentRoutes);
app.use("/stories", storyRoutes);
app.use("/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Facebook Clone API — server is running");
});

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Facebook server started on port ${port}`);
});
