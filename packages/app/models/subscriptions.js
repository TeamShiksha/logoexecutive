const mongoose = require("mongoose");
const { SubscriptionTypes } = require("../utils/constants");

/**
 * Subscriptions Model: Represents user subscription data in the application.
 * This model manages subscription types, usage limits, and payment information.
 * It enables efficient tracking and management of user subscriptions and their associated features.
 */

const subscriptionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(SubscriptionTypes),
    required: true,
  },
  key_limit: {
    type: Number,
    required: true,
  },
  usage_limit: {
    type: Number,
    required: true,
  },
  usage_count: {
    type: Number,
    default: 0,
  },
  is_active: {
    type: Boolean,
    required: true,
  },
  payment: {
    type: String,
    required: false,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

subscriptionSchema.statics.NewSubscription = function () {
  const now = new Date();
  const end = new Date(now);
  end.setMonth(now.getMonth() + 1);
  return {
    subscriptionType: SubscriptionTypes.HOBBY,
    key_limit: 2,
    usage_limit: 500,
    usage_count: 0,
    is_active: false,
    start_date: now,
    end_date: end,
    updated_at: new Date(),
  };
};

subscriptionSchema.methods.data = function () {
  return {
    _id: this._id,
    type: this.type,
    key_limit: this.key_limit,
    usage_limit: this.usage_limit,
    usage_count: this.usage_count,
    start_date: this.start_date,
    end_date: this.end_date,
    is_active: this.is_active,
    created_at: this._id.getTimestamp(),
    updated_at: this.updated_at,
  };
};

const Subscriptions = mongoose.model("subscriptions", subscriptionSchema);

module.exports = Subscriptions;
