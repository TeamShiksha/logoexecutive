const { Timestamp } = require("firebase-admin/firestore");
const { ImageCollection } = require("../utils/firestore");


async function createImageData(domainame, uploadedBy) {
  try {
    const imageData = {
      imageId: crypto.randomUUID(),
      domainame: domainame,
      uploadedBy: uploadedBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await ImageCollection.doc(imageData.imageId).set(imageData);
    return {
      imageId: imageData.imageId,
      createdAt: imageData.createdAt.toDate(),
      updatedAt: imageData.updatedAt.toDate()
    };
  } catch (error) {
    console.error(`Failed to create image data: ${error}`);
    throw error;
  }
}

module.exports = { createImageData };