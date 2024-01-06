const { Timestamp } = require("firebase-admin/firestore");

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
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
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
