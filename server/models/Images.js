const { Timestamp } = require("firebase-admin/firestore");
const { v4 } = require("uuid");

class Images {
  imageId;
  extension;
  domainame;
  uploadedBy;
  createdAt;
  updatedAt;

  /**
   * @param {Object} params
   * @param {string} params.imageId
   * @param {string} params.domainame
   * @param {string} params.uploadedBy
   * @param {Date} params.createdAt
   * @param {Date} params.updatedAt
   **/
  constructor(params) {
    this.imageId = params.imageId;
    this.extension = params.extension;
    this.domainame = params.domainame;
    this.uploadedBy = params.uploadedBy;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  get data() {
    return {
      imageId: this.imageId,
      extension: this.extension,
      domainame: this.domainame,
      uploadedBy: this.uploadedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Creates a new image object with current time for createdAt
   * and updatedAt
   *
   * @param {Object} imageData
   * @param {string} imageData.domainame
   * @param {string} imageData.uploadedBy
   * @param {string} imageData.extension
   **/
  static newImage(imageData) {
    const { domainame, uploadedBy, extension } = imageData;
    if (!domainame || !uploadedBy  || !extension) {
      return null;
    }
    return {
      imageId: v4(),
      extension,
      domainame,
      uploadedBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  }
}

module.exports = Images;