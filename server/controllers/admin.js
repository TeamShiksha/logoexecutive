const { uploadToS3 } = require("../services/Logo");
const { createImageData } = require("../services/Image");
const { STATUS_CODES } = require("http");
const Joi = require("joi");

const imageNameSchema = Joi.string().pattern(/^.+\.(png|jpg|svg)$/i);


async function adminUploadController(req, res, next) {
  const { userId, userType } = req.userData;
  let  {imageName}  = req.body;

  const { error } = imageNameSchema.validate(imageName);
  if (error) {
    return res.status(400).json({ error: "Invalid image name. It should include one of the following extensions: .png, .jpg, .svg" });
  }

  imageName = imageName.toLowerCase();
  if (userType !== "admin") {
    return res.status(403).json({ error: STATUS_CODES[403] });
  }

  try {
    const domainame = imageName;
    const uploadby = userId;

    const file = req.file;
    const key = await uploadToS3(file, imageName);

    const imageData = await createImageData(domainame, uploadby);

    res.status(200).json({
      message: `Image ${imageName} uploaded successfully to S3 bucket with key ${key}`,
      imageId: imageData.imageId,
      createdAt: imageData.createdAt,
      updatedAt: imageData.updatedAt
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {adminUploadController};
