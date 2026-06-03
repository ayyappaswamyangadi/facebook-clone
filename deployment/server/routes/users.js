const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { verify } = require("./auth");

// Update a user
router.put("/:id", verify, async (req, res) => {
  if (req.body.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    } catch (err) {
      return res.status(500).json(err);
    }
  }
  try {
    await User.findByIdAndUpdate(req.params.id, { $set: req.body });
    res.status(200).json("account has been updated");
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("account has been deleted");
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Search users by userName or email
router.get("/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json("query is required");
  try {
    const users = await User.find({
      $or: [
        { userName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("_id userName profilePicture")
      .limit(10);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get friend suggestions (users the current user doesn't follow)
router.get("/suggestions/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const excluded = [...currentUser.following, req.params.userId];
    const suggestions = await User.find({ _id: { $nin: excluded } })
      .select("_id userName profilePicture followers")
      .limit(5);
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get following friends list
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.following.map((friendId) => User.findById(friendId))
    );
    const friendList = friends
      .filter(Boolean)
      .map(({ _id, userName, profilePicture }) => ({
        _id,
        userName,
        profilePicture,
      }));
    res.status(200).json(friendList);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get user by userId or userName query param
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const userName = req.query.userName;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ userName: userName });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId === req.params.id) {
    return res.status(403).json("you cannot follow yourself");
  }
  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);
    if (!user.followers.includes(req.body.userId)) {
      await user.updateOne({ $push: { followers: req.body.userId } });
      await currentUser.updateOne({ $push: { following: req.params.id } });
      res.status(200).json(`you are now following ${user.userName}`);
    } else {
      res.status(403).json(`you are already following ${user.userName}`);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.params.id === req.body.userId) {
    return res.status(403).json("you cannot unfollow yourself");
  }
  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);
    if (user.followers.includes(req.body.userId)) {
      await user.updateOne({ $pull: { followers: req.body.userId } });
      await currentUser.updateOne({ $pull: { following: req.params.id } });
      res.status(200).json(`you have unfollowed ${user.userName}`);
    } else {
      res.status(403).json(`you are not following ${user.userName}`);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
