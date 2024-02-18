const { Timestamp } = require("firebase-admin/firestore");
const { ImageCollection } = require("../utils/firestore");
const { cloudFrontSignedURL } = require("../utils/cloudFront");

async function fetchImageByCompanyFree(company) {
  try{
    const imageCDNUrl = await firestore.runTransaction(async (transaction) => {
      const imageRef = await ImageCollection.where("imageUrl", ">=", company).
        where("imageUrl", "<=", company + "\uf8ff").get();
      if (imageRef.empty) return null;
      const doc = imageRef.docs[0];
      const imageUrl = doc.data().imageUrl;
      const cloudFrontUrl = cloudFrontSignedURL(`/${imageUrl}`).data;
      return cloudFrontUrl;
    });
    return imageCDNUrl;
  }
  catch (err) {
    throw err;
  }
}

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
  if (result.size > 0) return false;
  await ImageCollection.doc(imageData.imageId).set(imageData);
  return true;
}

module.exports = { createImageData, fetchImageByCompanyFree };
