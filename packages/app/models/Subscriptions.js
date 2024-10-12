const mongoose=require("mongoose");
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
    required: true
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
    default: 0
  },
  is_active: {
    type: Boolean,
    required: true,
  },
  payment:{
    type: String,
    required: false
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

subscriptionSchema.statics.NewSubscription = function (userId) {
  return {
    user: userId,
    subscriptionType: SubscriptionTypes.HOBBY,
    key_limit: 2,
    usage_limit: 500,
    usage_count: 0,
    is_active: false,
    updated_at: new Date(),
  };
};
subscriptionSchema.methods.data = function () {
  return {
    _id: this._id,
    user:this.user,
    type: this.type,
    key_limit: this.key_limit,
    usage_limit: this.usage_limit,
    usage_count: this.usage_count,
    is_active: this.is_active,
    created_at: this._id.getTimestamp(),
    updated_at: this.updated_at,
  };
};

const Subscriptions = mongoose.model("subscriptions", subscriptionSchema);

module.exports = Subscriptions;