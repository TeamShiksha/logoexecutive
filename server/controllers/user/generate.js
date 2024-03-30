const Joi = require("joi");
const {
  createKey,
  fetchKeysByuserid,
  fetchSubscriptionByuserid,
} = require("../../services");

const generateKeyPayloadSchema = Joi.object().keys({
  keyDescription: Joi.string()
    .trim()
    .required()
    .regex(/^[a-zA-Z\s]+$/u)
    .message("keyDescription must contain only alphabets"),
});

async function generateKeyController(req, res) {
  try {
    const { payload } = req.body;
    const { error, value } = generateKeyPayloadSchema.validate(payload);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: "Unprocessable payload",
      });
    }
    const { userId } = req.userData;
    const subscription = await fetchSubscriptionByuserid(userId);
    const keyLimit = subscription.keyLimit;

    var keyCount = 1;
    const keysObject = (await fetchKeysByuserid(userId)) || [];
    if (keysObject != null) {
      keyCount = keysObject.length;
    }

    if (keyCount >= keyLimit) {
      return res.status(403).json({
        message:
            "The maximum limit for key generation has been reached. Please consider upgrading your subscription to generate additional keys.",
        statusCode: 403,
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
        statusCode: 409,
        error: "Unprocessable payload",
      });
    }

    const data = {
      userId: req.userData.userId,
      keyDescription: req.body.keyDescription,
      createDate: req.body.createDate,
      apiKey: req.body.apiKey,
    };

    const UserKey = await createKey(data);
    const userKeyData = UserKey.data;
    if (userKeyData) {
      return res.status(200).json({
        message: "The key has been successfully generated!",
        statusCode: 200,
        data: userKeyData,
      });
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = generateKeyController;
