class ImageLogs {
  logId;
  imageId;
  apiKeyId;
  createdAt;

  constructor(params) {
    this.logId = params.logId;
    this.imageId = params.imageId;
    this.apiKeyId = params.isActive;
    this.createdAt = new Date.now();
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
