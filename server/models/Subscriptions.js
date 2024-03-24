const { Timestamp } = require("firebase-admin/firestore");
const { SubscriptionTypes } = require("../utils/constants");
const { normalizeDate } = require("../utils/date");

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
   * @param {Date} params.createdAt
   * @param {Date} params.updatedAt
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
		* Creates a new firebase document compatible subscription object
		* @param {string} userId 
		* @param {string} subscriptionType 
	**/
  static NewSubscription(userId) {
    return {
      subscriptionId: crypto.randomUUID(),
      userId,
      subscriptionType: SubscriptionTypes.HOBBY,
      keyLimit: 2,
      usageLimit: 500,
      isActive: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  }

  get data() {
    return {
      userId: this.userId,
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
