const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { verify } = require("./auth");
//update a user
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
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    res.status(200).json("account has been updated");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id, {
      $set: req.body,
    });
    res.status(200).json("account has been deleted");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//get user
// router.get("/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     const { _id, password, updatedAt, ...other } = user._doc;
//     res.status(200).json(other);
//     res.send(other);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const userName = req.query.userName;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ userName: userName });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
    res.send(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $push: { followers: req.body.userId },
        });
        await currentUser.updateOne({
          $push: {
            following: req.params.id,
          },
        });

        res.status(200).json(`you are now following ${user.userName}`);
      } else {
        res.status(403).json(`you are already following ${user.userName}`);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cannot follow yourself");
  }
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.params.id !== req.body.userId) {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);
    try {
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $pull: { followers: req.body.userId },
        });
        await currentUser.updateOne({
          $pull: { following: req.params.id },
        });
        res.status(200).json(`you have unfollowed ${user.userName}`);
      } else {
        res.status(403).json(`you are not following ${user.userName}`);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json(`you cannot unfollow yourself`);
  }
});

//get following friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.following.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, userName, profilePicture } = friend;
      friendList.push({ _id, userName, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", (req, res) => {
  res.send("This is the users page");
});

module.exports = router;
