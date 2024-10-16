const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { destroyKey } = require("../../services");
const { isValidObjectId } = require("mongoose");

const destroyKeyPayloadSchema = Joi.object({
  keyId: Joi.string().custom((value, helpers) => {
    if (!isValidObjectId(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }).required().messages({
    "any.invalid": "Key ID must be a valid mongodb objectId",
    "any.required": "Key ID is required",
  }),
});

async function destroyKeyController(req, res, next) {
  try {
    const { error, value } = destroyKeyPayloadSchema.validate(req.query);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }

    const { keyId } = value;
    const destroyed = await destroyKey(keyId);
    if (destroyed) {
      return res.status(200).json({
        message: "Key deleted successfully",
        statusCode: STATUS_CODES[200],
      });
    } else {
      return res.status(404).json({
        message: "Key not found or could not be deleted",
        statusCode: STATUS_CODES[404],
      });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = destroyKeyController;
