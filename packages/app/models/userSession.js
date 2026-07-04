const mongoose = require("mongoose");

/**
 * UserSession Model
 * Represents an active authenticated session for a specific device/browser.
 * Tracks session activity, device metadata, IP address, TTL, and soft logout.
 * 'isActive' marks whether the session is currently valid.
 */
const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  sessionId: {
    type: String,
    required: true,
    unique: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  expiresAt: {
    type: Date,
    required: true,
    expires: 0, // TTL
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  deviceInfo: {
    browser: { type: String, default: "Unknown" },
    os: { type: String, default: "Unknown" },
    deviceType: { type: String, default: "Unknown" },
  },

  lastActiveAt: { type: Date, default: Date.now },
});

userSessionSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model("userSession", userSessionSchema);
