const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {Images}= require("../models");
const { db:firestore, ImageCollection } = require("../utils/firestore");
const { cloudFrontSignedURL } = require("../utils/cloudFront");

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

async function uploadToS3(file, imageName, extension) {
  const uploadParams = {
    Bucket: process.env.BUCKET_NAME,
    Body: file.buffer,
    Key: `${process.env.KEY}/${extension}/${imageName}`,
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    return `${process.env.KEY}/${extension}/${imageName}`;
  } catch (error) {
    console.error(error);
    throw error; 
  }
}

async function fetchImageByCompanyFree(company) {
  try{
    const imageCDNUrl = await firestore.runTransaction(async () => {
      const imageRef = await ImageCollection.where("domainame", "==", company).get();
      if (imageRef.empty) return null;
      const doc = imageRef.docs[0];
      const extension = doc.data().extension;
      const imageUrl = doc.data().domainame + `.${extension}`;
      const cloudFrontUrl = cloudFrontSignedURL(`/${imageUrl}`).data;
      return cloudFrontUrl;
    });
    return imageCDNUrl;
  }
  catch (err) {
    throw err;
  }
}

async function createImageData(domainame, uploadedBy, extension) {
  try {
    const newImage = Images.newImage({
      domainame,
      uploadedBy,
      extension
    });
    if (!newImage) return null;
    const result = await ImageCollection.doc(newImage.imageId).set(newImage);
    if (!result) return null;
    return {
      imageId: newImage.imageId,
      createdAt: newImage.createdAt.toDate(),
      updatedAt: newImage.updatedAt.toDate()
    };
  } catch (error) {
    console.error(`Failed to create image data: ${error}`);
    throw error;
  }
}

module.exports = { createImageData, fetchImageByCompanyFree, uploadToS3 };
