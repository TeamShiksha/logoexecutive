const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");

const { Timestamp } = require("firebase-admin/firestore");
const { ImageCollection } = require("../utils/firestore");
const { cloudFrontSignedURL } = require("../utils/cloudFront");

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
      return cloudFrontUrl;
    });
    return imageCDNUrl;
  }
  catch (err) {
    throw err;
  }
}

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


module.exports = { createImageData, fetchImageByCompanyFree, upload, uploadToS3 };
