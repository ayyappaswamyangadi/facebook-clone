const router = require("express").Router();
const Comment = require("../models/Comment");

// Create a comment
router.post("/", async (req, res) => {
  const newComment = new Comment(req.body);
  try {
    const saved = await newComment.save();
    res.status(200).json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({
      createdAt: 1,
    });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like / unlike a comment
router.put("/:id/like", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json("comment not found");
    if (!comment.likes.includes(req.body.userId)) {
      await comment.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("comment liked");
    } else {
      await comment.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("comment unliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a comment
router.delete("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json("comment not found");
    if (comment.userId === req.body.userId) {
      await comment.deleteOne();
      res.status(200).json("comment deleted");
    } else {
      res.status(403).json("you can only delete your own comment");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
