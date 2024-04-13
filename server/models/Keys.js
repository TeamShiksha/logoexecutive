const { normalizeDate } = require("../utils/date");

class Keys {
  keyId;
  userId;
  key;
  keyDescription;
  usageCount;
  createdAt;
  updatedAt;

  /**
   * @param {Object} params
   * @param {string} params.keyId
   * @param {string} params.userId
   * @param {string} params.key
   * @param {number} params.usageCount
   * @param {Date|Timestamp|string} params.createdAt
   * @param {Date|Timestamp|string} params.updatedAt
   **/
  constructor(params) {
    this.keyId = params.keyId;
    this.userId = params.userId;
    this.keyDescription = params.keyDescription;
    this.key = params.key;
    this.usageCount = params.usageCount;
    this.createdAt = normalizeDate(params.createdAt);
    this.updatedAt = normalizeDate(params.updatedAt);
  }

  get data() {
    return {
      keyId: this.keyId,
      keyDescription: this.keyDescription,
      key: this.key,
      usageCount: this.usageCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Keys;
