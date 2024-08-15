const { SubscriptionTypes } = require("../constants");
const mongoose = require("mongoose");

/**
 * Hobby
 * PRO
 * TEAMS
 **/
const mockSubscriptions = [
  {
    user: new mongoose.Types.ObjectId("65bd32ab96c587421c08fd47").toString(),
    subscriptionType: SubscriptionTypes.HOBBY,
    keyLimit: 2,
    isActive: true,
    usageLimit: 5000,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    user: new mongoose.Types.ObjectId("65bd32ab96c587421c08fd47").toString(),
    subscriptionType: SubscriptionTypes.PRO,
    keyLimit: 5,
    isActive: true,
    usageLimit: 15000,
    usageCount: 15000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    user: new mongoose.Types.ObjectId("65bd32ab96c587421c08fd47").toString(),
    subscriptionType: SubscriptionTypes.TEAMS,
    keyLimit: 10,
    isActive: true,
    usageLimit: 50000,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports = { mockSubscriptions };
