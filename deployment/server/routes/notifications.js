const router = require("express").Router();
const Notification = require("../models/Notification");

// Create a notification (skip self-interactions)
router.post("/", async (req, res) => {
  if (req.body.userId === req.body.senderId) {
    return res.status(200).json({ skipped: true });
  }
  const newNotification = new Notification(req.body);
  try {
    const saved = await newNotification.save();
    res.status(200).json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId,
    })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get unread count for a user
router.get("/:userId/unread-count", async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.params.userId,
      read: false,
    });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Mark all notifications as read
router.put("/:userId/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, read: false },
      { $set: { read: true } }
    );
    res.status(200).json("all notifications marked as read");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Mark a single notification as read
router.put("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $set: { read: true },
    });
    res.status(200).json("notification marked as read");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
