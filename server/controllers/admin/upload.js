const { createImageData, uploadToS3 } = require("../../services");
const { STATUS_CODES } = require("http");
const Joi = require("joi");
let {UserType} = require("../../utils/constants");

const imageNameSchema = Joi.string()
  .pattern(/^.+\.(png|jpg|svg)$/i)
  .lowercase()
  .messages({
    "string.pattern.base": "Invalid image name. It should include one of the following extensions: .png, .jpg, .svg",
  });

async function adminUploadController(req, res, next) {
  try {
    let { userId, userType } = req.userData;
    let  {imageName}  = req.body;
    const file = req.file;

    if (!imageName || !file) {
      return res.status(400).json({
        status: 400,
        message: !imageName ? "Image name is required" : "Image file is required",
        error: STATUS_CODES[400]
      });
    }

    const { error } = imageNameSchema.validate(imageName);
    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message,
        error: STATUS_CODES[400]
      });
    }

    if (userType !== UserType.ADMIN ) {
      return res.status(403).json({
        status: 403,
        error: STATUS_CODES[403]
      });
    }
    const imageNameParts = imageName.split(".");
    const extension = imageNameParts[imageNameParts.length - 1];
    const domainame = imageName;
    const uploadby = userId;

    const key = await uploadToS3(file, imageName, extension);

    const imageData = await createImageData(domainame, uploadby, extension);
    res.status(200).json({
      status: 200,
      message: `Image ${imageName} uploaded successfully to S3 bucket`,
      imageId: imageData.imageId,
      createdAt: imageData.createdAt,
      updatedAt: imageData.updatedAt
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {adminUploadController};