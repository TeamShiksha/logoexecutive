const Subscriptions = require("../../models/Subscriptions");
const { Timestamp } = require("firebase-admin/firestore");

const subscriptionObj = {
  userId: crypto.randomUUID(),
  subscriptionId: crypto.randomUUID(),
  subscriptionType: "free",
  keyLimit: "2",
  usageLimit: "500",
  isActive: "true",
  createdAt: "Timestamp.now().toDate()",
  updatedAt: "Timestamp.now().toDate()",
};

const mockSubscriptionModel = new Subscriptions(subscriptionObj);

module.exports = {
  mockSubscriptionModel,
};