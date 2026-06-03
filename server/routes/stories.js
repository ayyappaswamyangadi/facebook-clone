const router = require("express").Router();
const Story = require("../models/Story");
const User = require("../models/User");

// Create a story
router.post("/", async (req, res) => {
  const newStory = new Story(req.body);
  try {
    const saved = await newStory.save();
    res.status(200).json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get timeline stories (own + following), grouped by userId
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const now = new Date();

    const userStories = await Story.find({
      userId: currentUser._id.toString(),
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1 });

    const friendStoriesArrays = await Promise.all(
      currentUser.following.map((friendId) =>
        Story.find({ userId: friendId, expiresAt: { $gt: now } }).sort({
          createdAt: -1,
        })
      )
    );

    const allStories = [userStories, ...friendStoriesArrays].flat();

    // Group by userId
    const grouped = {};
    allStories.forEach((story) => {
      if (!grouped[story.userId]) grouped[story.userId] = [];
      grouped[story.userId].push(story);
    });

    res.status(200).json(grouped);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a story
router.delete("/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json("story not found");
    if (story.userId === req.body.userId) {
      await story.deleteOne();
      res.status(200).json("story deleted");
    } else {
      res.status(403).json("you can only delete your own story");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
