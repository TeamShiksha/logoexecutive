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
   * @param {Date} params.createdAt
   * @param {Date} params.updatedAt
   **/
  constructor(params) {
    this.keyId = params.keyId;
    this.userId = params.userId;
    this.key = params.key;
    this.usageCount = params.usageCount;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  get data() {
    return {
      keyId: this.keyId,
      userId: this.userId,
      key: this.key,
      usageCount: this.usageCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Keys;
