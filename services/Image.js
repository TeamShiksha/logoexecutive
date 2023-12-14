const { Timestamp } = require("firebase-admin/firestore");
const Images = require("../models/Images");
const { ImageCollection } = require("../utils/firestore");

async function createImageData(file) {
  const imageData = {
    imageURL: file,
    imageUsageCount: 0,
    imageId: crypto.randomUUID(),
    createAt: Timestamp,
    updatedAt: Timestamp,
  };

  const result = await ImageCollection.where(
    "imageURL",
    "==",
    firstoreData.imageURL
  ).get();
  if (result.size > 0) {
    return false;
  }
  const imagesDataCreated = new Images(imageData);
  await ImageCollection.add(imagesDataCreated);
  return true;
}

module.exports = { createImageData };
