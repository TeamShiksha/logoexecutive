const { FieldValue } = require("firebase-admin/firestore");
const { cloudFrontSignedURL } = require("../utils/cloudFront");
const { db: firestore, ImageCollection  } = require("../utils/firestore");

async function fetchImageByCompanyFree(company) {
  try{
    const imageCDNUrl = await firestore.runTransaction(async (transaction) => {
      const imageRef = await ImageCollection.where("imageUrl", ">=", company).
        where("imageUrl", "<=", company + "\uf8ff").get();
      if (imageRef.empty) return null;
      const doc = imageRef.docs[0];
      const imageUrl = doc.data().imageUrl;
      const cloudFrontUrl = cloudFrontSignedURL(`/${imageUrl}`).data;

      // Increment imageUsage count atomically
      const updatedCount = { "imageUsageCount": FieldValue.increment(1) };
      if (cloudFrontUrl) {
        transaction.update(doc.ref, updatedCount);
      }
      return cloudFrontUrl;
    });

    return imageCDNUrl;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = { fetchImageByCompanyFree };