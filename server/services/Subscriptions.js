const { Subscriptions } = require("../models");
const { SubscriptionTypes } = require("../utils/constants");
const { SubscriptionCollection } = require("../utils/firestore");
const { Timestamp } = require("firebase-admin/firestore");

async function createSubscription(userId) {
  try {
    const subscriptionData = Subscriptions.NewSubscription(userId);
    const result = await SubscriptionCollection.doc(subscriptionData.subscriptionId).set(subscriptionData);

    const UserSubscription = new Subscriptions(subscriptionData);
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
    if (subscriptionRef.empty) return null;
    const subscription = new Subscriptions({
      ...subscriptionRef.docs[0].data(),
    });
    subscription.createdAt = subscription.createdAt.toDate();
    subscription.updatedAt = subscription.updatedAt.toDate();
    return subscription;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  createSubscription, fetchSubscriptionByuserid
};
