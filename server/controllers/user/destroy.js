const Joi = require("joi");
const { destroyKey } = require("../../services");

const destroyKeyPayloadSchema = Joi.object({
  keyId: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "\"keyId\" must be a valid UUID",
    "any.required": "\"keyId\" is a required field",
  }),
});

async function destroyKeyController(req, res) {
  try {
    const { error, value } = destroyKeyPayloadSchema.validate(req.query);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: "Unprocessable payload",
      });
    }
  
    const { keyId } = value;
    const destroyed = await destroyKey(keyId);
    if (destroyed) {
      return res.status(200).json({
        message: "Key deleted successfully!",
        statusCode: 200,
      });
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = destroyKeyController;
