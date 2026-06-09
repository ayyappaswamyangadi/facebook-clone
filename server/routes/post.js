const post = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { verify } = require("./auth");

// create a post
post.post("/", async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json("User not found. Please log in again.");
    }
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// search posts by description — must be before /:id
post.get("/search", async (req, res) => {
  const q = req.query.q;
  if (!q || !q.trim()) return res.status(200).json([]);
  try {
    const posts = await Post.find({
      desc: { $regex: q.trim(), $options: "i" },
    }).sort({ createdAt: -1 }).limit(20);

    const uniqueUserIds = [...new Set(posts.map((p) => String(p.userId)))];
    const users = await User.find({ _id: { $in: uniqueUserIds } }).select("userName profilePicture");
    const userMap = {};
    users.forEach((u) => { userMap[String(u._id)] = { userName: u.userName, profilePicture: u.profilePicture }; });

    const postsWithUser = posts.map((p) => ({
      ...p.toObject(),
      userName: userMap[String(p.userId)]?.userName,
      userProfilePicture: userMap[String(p.userId)]?.profilePicture,
    }));

    res.status(200).json(postsWithUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get news feed posts
post.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) return res.status(404).json("User not found.");
    const userId = String(currentUser._id);
    const userPosts = await Post.find({ userId: currentUser._id, hiddenBy: { $ne: userId } });
    const friendPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId, hiddenBy: { $ne: userId } });
      })
    );
    const allPosts = userPosts.concat(...friendPosts);

    const uniqueUserIds = [...new Set(allPosts.map((p) => String(p.userId)))];
    const users = await User.find({ _id: { $in: uniqueUserIds } }).select("userName profilePicture");
    const userMap = {};
    users.forEach((u) => { userMap[String(u._id)] = { _id: u._id, userName: u.userName, profilePicture: u.profilePicture }; });

    res.status(200).json(allPosts.map((p) => ({ ...p.toObject(), user: userMap[String(p.userId)] || null })));
  } catch (err) {
    res.status(500).json(err);
  }
});

// get user's all posts
post.get("/profile/:userName", async (req, res) => {
  try {
    const currentUser = await User.findOne({ userName: req.params.userName });
    if (!currentUser) return res.status(404).json("User not found.");
    const userPosts = await Post.find({ userId: currentUser._id });
    const userData = { _id: currentUser._id, userName: currentUser.userName, profilePicture: currentUser.profilePicture };
    res.status(200).json(userPosts.map((p) => ({ ...p.toObject(), user: userData })));
  } catch (err) {
    res.status(500).json(err);
  }
});

// get hidden posts for a user
post.get("/hidden/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ hiddenBy: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get a single post — keep after named routes
post.get("/:id", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update a post
post.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found.");
    if (post.userId == req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("post has been updated");
    } else {
      res.status(403).json("you can only update your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete a post
post.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found.");
    if (post.userId == req.body.userId) {
      await post.deleteOne();
      res.status(200).json("post has been deleted");
    } else {
      res.status(403).json("you can only delete your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// like a post
post.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found.");
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("the post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// hide a post
post.put("/:id/hide", async (req, res) => {
  try {
    const p = await Post.findById(req.params.id);
    if (!p) return res.status(404).json("Post not found.");
    if (!p.hiddenBy.includes(req.body.userId)) {
      await p.updateOne({ $push: { hiddenBy: req.body.userId } });
      res.status(200).json("Post hidden");
    } else {
      res.status(200).json("Already hidden");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// unhide a post
post.put("/:id/unhide", async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      $pull: { hiddenBy: req.body.userId },
    });
    res.status(200).json("Post unhidden");
  } catch (err) {
    res.status(500).json(err);
  }
});

post.get("/", (req, res) => {
  res.send("I am in post page now");
});

module.exports = post;
