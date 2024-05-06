const { Subscriptions } = require("../models");
const { SubscriptionCollection } = require("../utils/firestore");

/**
 * @param {string} userId - userId of user
 **/
async function createSubscription(userId) {
  try {
    const subscriptionData = Subscriptions.NewSubscription(userId);
    const result = await SubscriptionCollection.doc(
      subscriptionData.subscriptionId
    ).set(subscriptionData);

    const UserSubscription = new Subscriptions(subscriptionData);
    return UserSubscription;
  } catch (err) {
    throw err;
  }
}

async function fetchSubscriptionByuserid(userId) {
  try {
    const subscriptionRef = await SubscriptionCollection.where(
      "userId",
      "==",
      userId
    )
      .limit(1)
      .get();
    if (subscriptionRef.empty) return null;
    const subscription = new Subscriptions(subscriptionRef.docs[0].data());

    return subscription;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createSubscription,
  fetchSubscriptionByuserid,
};
