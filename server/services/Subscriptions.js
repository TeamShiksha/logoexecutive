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

/**
 * Checks if the user is allowed to make API calls
 * 
 * @param {string} userId - userId of user 
**/
async function isApiUsageLimitExceed(userId) {
  try{
    const subscription = await Subscriptions.findOne({user:userId});
    if(subscription.usageCount == subscription.usageLimit) return true;
    return false;
  }catch(err){
    throw err;
  }
}

/**
 * Updates the API usage count for a given user.
 * 
 * @param {string} userId - userId of user
 * @returns {Promise<number|null>} - The number of documents modified, or null if no document was found to update.
 **/
async function updateApiUsageCount(userId){
  try{
    const subscription =await Subscriptions.updateOne({user:userId},{$inc:{usageCount:1}}).exec();
    
    if(!subscription.matchedCount===0) return null;
    return subscription.modifiedCount;
  }catch(err){
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
  updateApiUsageCount,
  isApiUsageLimitExceed
};
