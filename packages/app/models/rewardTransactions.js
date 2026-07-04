const mongoose = require("mongoose");

/**
 * RewardTransactions Model: Immutable audit log for all reward changes.
 * Each transaction represents a single reward issuance event, creating a complete audit trail.
 * Transactions are never deleted - they are the source of truth for reward history.
 */

const rewardTransactionSchema = new mongoose.Schema(
  {
    image_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "images",
      default: null,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    transaction_type: {
      type: String,
      enum: ["MILESTONE_REWARD", "MANUAL_ADJUSTMENT", "REVERSAL", "BONUS"],
      required: true,
    },
    milestone: {
      type: Number,
      default: null,
    },
    points_awarded: {
      type: Number,
      required: true,
    },
    points_reversed: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: null,
    },
    reason: {
      type: String,
      enum: [
        "NORMAL_MILESTONE",
        "DUPLICATE_REMOVAL",
        "SUSPICIOUS_ACTIVITY",
        "MANUAL_CORRECTION",
        "PROMOTION",
        "SYSTEM_ERROR",
        null,
      ],
      default: null,
    },
    previous_total: {
      type: Number,
      required: true,
    },
    new_total: {
      type: Number,
      required: true,
    },
    is_reversed: {
      type: Boolean,
      default: false,
    },
    reversed_at: {
      type: Date,
      default: null,
    },
    reversed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    reversal_reason: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);
const RewardTransactions = mongoose.model(
  "reward_transactions",
  rewardTransactionSchema
);

module.exports = RewardTransactions;
