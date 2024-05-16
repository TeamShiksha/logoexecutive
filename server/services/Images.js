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
      const imageRef = await ImageCollection.where("domainame", ">=", company).
        where("domainame", "<=", company + "\uf8ff").get();
      if (imageRef.empty) return null;
      const doc = imageRef.docs[0];
      const imageUrl = doc.data().domainame;
      const cloudFrontUrl = cloudFrontSignedURL(`/${imageUrl}`).data;
      return cloudFrontUrl;
    });
    return imageCDNUrl;
  }
  catch (err) {
    throw err;
  }
}

async function getImagesByUserId(userId) {
  try {
    const imagesSnapshot = await ImageCollection.where("uploadedBy", "==", userId).get();
    if (imagesSnapshot.empty) return null;
    const images = imagesSnapshot.docs.map(doc => {
      return {
        domainame: doc.data().domainame,
        imageId: doc.data().imageId,
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      };
    });
    return images;
  } catch (error) {
    throw error;
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


module.exports = { createImageData, fetchImageByCompanyFree, uploadToS3, getImagesByUserId };
