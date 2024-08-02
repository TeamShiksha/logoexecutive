const mongoose=require("mongoose");
const { SubscriptionTypes } = require("../utils/constants");

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  subscriptionType: {
    type: String,
    required: true,
  },
  keyLimit: {
    type: Number,
    required: true,
  },
  usageLimit: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

subscriptionSchema.statics.NewSubscription = function (userId) {
  return {
    user: userId,
    subscriptionType: SubscriptionTypes.HOBBY,
    keyLimit: 2,
    usageLimit: 500,
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
subscriptionSchema.methods.getSubscriptionData = function () {
  return {
    _id: this._id,
    user:this.user,
    subscriptionType: this.subscriptionType,
    keyLimit: this.keyLimit,
    usageLimit: this.usageLimit,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Subscriptions = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscriptions;
