const mongoose = require("mongoose");

/**
 * MilestoneConfig Model: Admin-managed table storing milestone thresholds and point values.
 * The reward worker reads the single active config at runtime — no deploy required to change thresholds.
 * Only one config may have is_active = true at a time (enforced at the repository layer).
 */
const milestoneConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      description: "Human-readable label",
    },
    thresholds: {
      type: [
        {
          at: {
            type: Number,
            required: true,
            min: 1,
            description: "Unique Pro user count at which this threshold is hit",
          },
          points: {
            type: Number,
            required: true,
            min: 1,
            description: "Points awarded when this threshold is crossed",
          },
        },
      ],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "thresholds must be a non-empty array",
      },
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: only query non-deleted docs efficiently
milestoneConfigSchema.index({ is_active: 1, is_deleted: 1 });

const MilestoneConfig = mongoose.model(
  "milestone_config",
  milestoneConfigSchema,
  "milestone_configs"
);

module.exports = MilestoneConfig;
