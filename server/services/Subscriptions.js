const { Subscriptions } = require("../models");

/**
 * @param {string} userId - userId of user
 **/
async function createSubscription(userId) {
  try {
    const subscriptionData = Subscriptions.NewSubscription(userId);
    const UserSubscription = new Subscriptions(subscriptionData);
    const result = await UserSubscription.save();
    const {_id , ...restSubscriptionData} = result._doc;
    const subscription = { subscriptionId:_id, ...restSubscriptionData};
    return subscription;
  } catch (err) {
    throw err;
  }
}

async function fetchSubscriptionByuserid(userId) {
  try {
    const subscription = await Subscriptions.findOne({ "user":userId });
    if (!subscription) return null;
    const {_id , ...restSubscriptionData} = subscription._doc;
    const subscriptionData = { subscriptionId:_id, ...restSubscriptionData};
    return subscriptionData;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createSubscription,
  fetchSubscriptionByuserid,
};
