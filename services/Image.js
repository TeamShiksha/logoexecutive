const { Timestamp } = require("firebase-admin/firestore");
const Images = require("../models/Images");
const { ImageCollection } = require("../utils/firestore");

async function createImageData(file) {
  const imageData = {
    imageURL: file,
    imageUsageCount: 0,
    imageId: crypto.randomUUID(),
    createAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const result = await ImageCollection.where(
    "imageURL",
    "==",
    imageData.imageURL
  ).get();
  if (result.size > 0) {
    return false;
  }
  await ImageCollection.add(newImagesData);
  return true;
}

module.exports = { createImageData };
