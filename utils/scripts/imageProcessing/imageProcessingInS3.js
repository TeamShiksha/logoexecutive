const { S3Client } = require("@aws-sdk/client-s3");

const bucketName = process.env.BUCKET_NAME;
const buckeRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccesskey = process.env.SECRET_ACCESS_KEY;

const storeImageInS3 = async (req, res) => {
  try {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccesskey,
      },
      region: buckeRegion,
    });
    const params = {
      Bucket: bucketName,
      Key: req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

module.exports = { storeImageInS3 };
