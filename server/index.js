require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const conversationRoutes = require("./routes/conversations");
const messageRoutes = require("./routes/messages");
const databaseConnection = require("./database-connection");
const postRoutes = require("./routes/post");
const notificationRoutes = require("./routes/notifications");
const storiesRoutes = require("./routes/stories");
const commentsRoutes = require("./routes/comments");
const port = process.env.PORT;
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

databaseConnection();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//middleware
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("common"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/post", postRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);
app.use("/notifications", notificationRoutes);
app.use("/stories", storiesRoutes);
app.use("/comments", commentsRoutes);

app.use("/images", express.static(path.join(__dirname, "public/images")));

//upload file
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "facebook-clone",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const uploads = multer({ storage });
app.post("/upload", uploads.single("file"), (req, res) => {
  try {
    return res.status(200).json(req.file.path);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.get("/", (req, res) => {
  res.send("This is the Home page");
});
//before version
// dbConnect().then((response) => {
//   response
//     .find()
//     .toArray()
//     .then((data) => {
//       console.warn(data);
//     });
// });

//modern javascript
// const main = async () => {
//   let data = await dbConnect();
//   data = await data.find().toArray();
//   console.warn(data);
// };
// main();



app.listen(port || 5757, () => {
  console.log("facebook server has been started at port", port);
});

// mongoose.connect(
//   process.env.MONGO_URL,
//   { useNewUtlParser: true, useUnifiedTopology: true },
//   () => {
//     console.log("connected to mongoDB");
//   }
// );

// mongoose.connect("mongodb://localhost:27017/test", () => {
//   console.log("connected to mongoDB");
// });
