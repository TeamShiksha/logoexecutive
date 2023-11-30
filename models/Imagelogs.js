class ImageLogs {
  logId;
  imageId;
  keyId;
  createdAt;
  lastAccessed;

  /**
   * @param {Object} params
   * @param {string} params.logId
   * @param {string} params.imageId
   * @param {string} params.keyId
   * @param {Date} params.createdAt
   * @param {Date} params.lastAccessed
   **/
  constructor(params) {
    this.logId = params.logId;
    this.imageId = params.imageId;
    this.keyId = params.keyId;
    this.createdAt = params.createdAt;
    this.lastAccessed = params.lastAccessed;
  }

  getSubscriptionData() {
    return {
      logId: this.logId,
      imageId: this.imageId,
      apiKeyId: this.apiKeyId,
      createdAt: this.createdAt,
    };
  }
}

module.exports = ImageLogs;
