const { Timestamp } = require("firebase-admin/firestore");
class Images {
  imageId;
  imageUrl;
  createdAt;
  updatedAt;
  imageUsageCount;

  /**
   * @param {Object} params
   * @param {string} params.imageId
   * @param {string} params.imageUrl
   * @param {number} params.imageUsageCount
   * @param {Date} params.createdAt
   * @param {Date} params.updatedAt
   **/
  constructor(params) {
    this.imageId = params.imageId;
    this.imageUrl = params.imageUrl;
    this.imageUsageCount = params.imageUsageCount;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  get data() {
    return {
      imageId: this.imageId,
      imageUrl: this.imageUrl,
      imageUsageCount: this.imageUsageCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Images;
