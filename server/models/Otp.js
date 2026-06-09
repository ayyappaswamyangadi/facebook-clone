const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  purpose: { type: String, enum: ["register", "reset"], required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // 10-minute TTL
});

OtpSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model("Otp", OtpSchema);
