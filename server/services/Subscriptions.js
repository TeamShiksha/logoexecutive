const { Subscriptions } = require("../models");

/**
 * @param {string} userId - userId of user
 **/
async function createSubscription(userId) {
  try {
    const subscriptionData = Subscriptions.NewSubscription(userId);
    // const UserSubscription = await Subscriptions.create(subscriptionData);
    const UserSubscription = new Subscriptions(subscriptionData);
    const result = await UserSubscription.save();
    return result;
  } catch (err) {
    throw err;
  }
}

async function fetchSubscriptionByuserid(userId) {
  try {
    const subscription = await Subscriptions.findOne({ "user":userId });
    return subscription || null;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createSubscription,
  fetchSubscriptionByuserid,
};
