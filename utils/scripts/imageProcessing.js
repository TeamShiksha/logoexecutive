const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { createImageData } = require("../../services/Image");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const imagePath = path.resolve(process.cwd(), "assets/");
const s3Client = new S3Client({
        credentials: {
          accessKeyId: process.env.ACCESS_KEY,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
        region: process.env.BUCKET_REGION,
      });

(async () => {
  if (fs.existsSync(imagePath)) {
    const files = fs.readdirSync(imagePath);
    for (file in files){
      
    }
    const imageFilePromise = files.map((image) => firestoreImageData2(image));
    const results = await Promise.all(imageFilePromise);

    if (!results) process.exit(1);
    for (const result of results) {
      if (!result){
        continue
      } else {
       const imagePaths = `${imagePath}/${file}`;
        console.log(imagePaths);
        const params = {
          Bucket: bucketName,
          Key: `production/assets/${file}`,
          Body: fs.readFileSync(imagePaths),
        };
        const command = new PutObjectCommand(params);
        await s3Client.send(command); 
      }
      console.log("uploading of images was successful");
      process.exit(0);
    }
  } else {
    console.error("Failed to load images...");
    process.exit(1);
  }
})();
