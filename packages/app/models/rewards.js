const mongoose = require("mongoose");

/**
 * Rewards Model: Tracks reward progress per logo.
 * This model stores all reward-related data including milestones, pro users, and audit history.
 */

const rewardSchema = new mongoose.Schema(
  {
    image_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "images",
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    unique_pro_users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    unique_pro_users_count: {
      type: Number,
      default: 0,
    },
    milestones_achieved: [
      {
        milestone: Number,
        achieved_at: Date,
        points_awarded: Number,
      },
    ],
    total_points_awarded: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
rewardSchema.index({ user_id: 1, createdAt: -1 });
rewardSchema.index({ createdAt: -1 });
const Rewards = mongoose.model("rewards", rewardSchema);

module.exports = Rewards;
