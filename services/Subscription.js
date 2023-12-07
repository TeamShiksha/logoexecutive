const Subscription = require("../models/Subscriptions");
const { SubscriptionCollection } = require("../utils/firestore");
const { Timestamp } = require("firebase-admin/firestore");

async function createSubscription(userId) {
  try {
    const subscriptionData = {
      subscriptionId: crypto.randomUUID(),
      userId: userId,
      subscriptionType: "free",
      KeyLimit: 2,
      usageLimit: 500,
      isActive: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const result = await SubscriptionCollection.add(subscriptionData);
    const UserSubscription = new Subscription(subscriptionData);
    return UserSubscription;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
 
async function fetchSubscriptionByuserid(userId) {
  try {
    const subscriptionRef = await SubscriptionCollection.where("userId", "==", userId)
      .limit(1).get();
    if (subscriptionRef.empty) {
      return null;
    }
    
    const subscription = new Subscription({
      ...subscriptionRef.docs[0].data(),
    });
    return subscription;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  createSubscription, fetchSubscriptionByuserid
};