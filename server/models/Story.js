const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    img: { type: String, default: "" },
    desc: { type: String, maxLength: 200, default: "" },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", StorySchema);
