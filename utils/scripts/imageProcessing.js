const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { createImageData } = require("../../services/Image");

const bucketName = process.env.BUCKET_NAME;
const imagePath = path.resolve(process.cwd(), "assets/");
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: process.env.BUCKET_REGION,
});

(() => {
  fs.readdir(imagePath, async (err, files) => {
    if (err) {
      console.log("Error reading image folder:", err);
      process.exit(0);
    } else {
      for (let image of files) {
        const ImageData = await createImageData(image);
        const imagePaths = `${imagePath}/${image}`;
        if (ImageData) {
          const params = {
            Bucket: bucketName,
            Key: image,
            Body: fs.readFileSync(imagePaths),
          };
          const command = new PutObjectCommand(params);
          await s3Client.send(command);
          console.log(`Data inserted for ${image}`);
        } else {
          console.log(`Data already present for ${image}`);
        }
        fs.unlink(imagePaths, (err) => {
          if (err) {
            console.error("Error deleting file:", imagePaths, err);
          } else {
            console.log("Deleted file:", imagePaths);
          }
        });
      }
    }
  });
})();
