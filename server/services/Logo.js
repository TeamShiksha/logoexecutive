const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const { FieldValue } = require("firebase-admin/firestore");
const { cloudFrontSignedURL } = require("../utils/cloudFront");
const { db: firestore, ImageCollection  } = require("../utils/firestore");

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multer.memoryStorage()
});

async function uploadToS3(file, imageName) {
  const uploadParams = {
    Bucket: process.env.BUCKET_NAME,
    Body: file.buffer,
    Key: `${process.env.KEY}/${imageName}`,
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    return `${process.env.KEY}/${imageName}`;
  } catch (error) {
    console.error(`Failed to upload file to S3: ${error}`);
    throw error; 
  }
}

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

module.exports = { fetchImageByCompanyFree, uploadToS3, upload };