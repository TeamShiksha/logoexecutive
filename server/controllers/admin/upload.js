const { createImageData, uploadToS3 } = require("../../services");
const { STATUS_CODES } = require("http");
const Joi = require("joi");
let {UserType} = require("../../utils/constants");

const imageNameSchema = Joi.string()
  .pattern(/^.+\.(png|jpg|svg)$/i)
  .lowercase()
  .messages({
    "string.pattern.base": "Invalid image name. Should include extensions: .png, .jpg, .svg",
  });

async function adminUploadController(req, res, next) {
  try {
    let { userId } = req.userData;
    let  {imageName}  = req.body;
    const file = req.file;

    if (!imageName || !file) {
      return res.status(422).json({
        statusCode: STATUS_CODES[422],
        message: !imageName ? "Image name is required" : "Image file is required",
        error: "Unprocessable payload"
      });
    }

    const { error } = imageNameSchema.validate(imageName);
    if (error) {
      return res.status(422).json({
        statusCode: STATUS_CODES[422],
        message: error.details[0].message,
        error: "Unprocessable payload"
      });
    }
    const imageNameParts = imageName.split(".");
    const extension = imageNameParts[imageNameParts.length - 1];
    const domainame = imageName;
    const uploadby = userId;

    const key = await uploadToS3(file, imageName, extension);
    if(!key){
      res.status(500).json({
        statusCode: STATUS_CODES[500],
        message: "Image Upload Failed, try again later"
      });
    }
    const imageData = await createImageData(domainame, uploadby, extension);
    if(!imageData){
      res.status(500).json({
        statusCode: STATUS_CODES[500],
        message: "Failed to create record"
      });
    }

    res.status(200).json({
      statusCode: STATUS_CODES[200],
      message: "Upload successfully",
      data: imageData
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {adminUploadController};