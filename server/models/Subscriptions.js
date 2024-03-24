const { Timestamp } = require("firebase-admin/firestore");
const { SubscriptionTypes } = require("../utils/constants");
const { normalizeDate } = require("../utils/date");
const { v4 } = require("uuid");

class Subscriptions {
  userId;
  subscriptionId;
  subscriptionType;
  keyLimit;
  usageLimit;
  isActive;
  createdAt;
  updatedAt;

  /**
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.subscriptionType
   * @param {string} params.subscriptionId
   * @param {number} params.keyLimit
   * @param {number} params.usageLimit
   * @param {boolean} params.isActive
   * @param {Date|Timestamp|string} params.createdAt
   * @param {Date|Timestamp|string} params.updatedAt
   **/
  constructor(params) {
    this.userId = params.userId;
    this.subscriptionId = params.subscriptionId;
    this.subscriptionType = params.subscriptionType;
    this.keyLimit = params.keyLimit;
    this.usageLimit = params.usageLimit;
    this.isActive = params.isActive;
    this.createdAt = normalizeDate(params.createdAt);
    this.updatedAt = normalizeDate(params.updatedAt);
  }

  /**
    * Creates a firestore document compatible object
    *
    * @param {string} userId 
    **/
  static NewSubscription(userId) {
    return {
      userId,
      subscriptionId: v4(),
      subscriptionType: SubscriptionTypes.HOBBY,
      keyLimit: 2,
      usageLimit: 500,
      isActive: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  }

  get data() {
    return {
      subscriptionId: this.subscriptionId,
      subscriptionType: this.subscriptionType,
      keyLimit: this.keyLimit,
      usageLimit: this.usageLimit,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Subscriptions;
