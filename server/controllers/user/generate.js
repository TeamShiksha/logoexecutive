const Joi = require("joi");
const { STATUS_CODES } = require("http");
const {
  createKey,
  fetchKeysByuserid,
  fetchSubscriptionByuserid,
} = require("../../services");

const generateKeyPayloadSchema = Joi.object().keys({
  keyDescription: Joi.string()
    .trim()
    .required()
    .max(20)
    .regex(/^[a-zA-Z\s]*$/)
    .messages({
      "string.base": "Description must be a string",
      "any.required": "Description is required",
      "string.max": "Description must be 20 characters or fewer",
      "string.pattern.base": "Description must contain only alphabets and spaces",
    }),
});

async function generateKeyController(req, res, next) {
  try {
    const { keyDescription } = req.body;
    const { error } = generateKeyPayloadSchema.validate({ keyDescription });

    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: STATUS_CODES[422],
        error: "Unprocessable payload",
      });
    }
    const { userId } = req.userData;
    const subscription = await fetchSubscriptionByuserid(userId);
    const keyLimit = subscription.keyLimit;

    let keyCount = 1;
    const keysObject = (await fetchKeysByuserid(userId)) || [];
    if (keysObject) {
      keyCount = keysObject.length;
    }

    if (keyCount >= keyLimit) {
      return res.status(403).json({
        message:
          "The maximum limit for key generation has been reached. Please consider upgrading your subscription to generate additional keys",
        statusCode: STATUS_CODES[403],
        error: "Forbidden",
      });
    }

    const duplicateKeyDescription =
      keysObject.length > 0 &&
      keysObject.every((keys) =>
        req.body.keyDescription.includes(keys.keyDescription)
      );

    if (duplicateKeyDescription) {
      return res.status(409).json({
        message: "Please provide a different key description",
        statusCode: STATUS_CODES[409],
        error: "Conflict",
      });
    }

    const data = {
      userId: req.userData.userId,
      keyDescription: req.body.keyDescription,
    };

    const UserKey = await createKey(data);
    const userKeyData = UserKey.data;
    if (userKeyData) {
      return res.status(200).json({
        message: "Key generated successfully",
        statusCode: STATUS_CODES[200],
        data: userKeyData,
      });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = generateKeyController;
