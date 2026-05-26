const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },     // recipient
    senderId: { type: String, required: true },    // who triggered it
    type: {
      type: String,
      enum: ["like", "comment", "follow", "message"],
      required: true,
    },
    postId: { type: String, default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
