const { Timestamp } = require("firebase-admin/firestore");
const { ImageCollection } = require("../utils/firestore");

async function createImageData(file) {
  const imageData = {
    imageUrl: file,
    imageUsageCount: 0,
    imageId: crypto.randomUUID(),
    createAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const result = await ImageCollection.where(
    "imageUrl",
    "==",
    imageData.imageUrl
  ).get();
  if (result.size > 0) {
    return false;
  }
  await ImageCollection.add(imageData);
  return true;
}

module.exports = { createImageData };
