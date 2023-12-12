const {createKey, fetchKeyByuserid} = require("../services/Key");
const {fetchSubscriptionByuserid} = require("../services/Subscription");
const Joi = require("joi");

const generateKeyPayloadSchema = Joi.object().keys({
  keyDescription: Joi.string()
    .trim()
    .required()
    .regex(/^[a-zA-Z\s]+$/u)
    .message("keyDescription must contain only alphabets")
});

async function generateKey(req, res){
  try {
    const {payload} = req.body;
    const {error, value} = generateKeyPayloadSchema.validate(payload);
    if (error){
      return res
        .status(422)
        .json({
          message: error.message,
          statusCode: 422,
          error: "Unprocessable payload",
        });
    }
    const {userId} = req.userData;
    const subscription = await fetchSubscriptionByuserid(userId);
    const keyLimit = subscription.keyLimit;

    var keyCount = 1;
    const keysObject = await fetchKeyByuserid(userId);
    if (keysObject!=null){
      keyCount = keysObject.length; 
    }
    if (keyCount >= keyLimit){
      return res
        .status(403)
        .json({
          message: "Key generation limit reached. Upgrade your subscription to generate more.",
          statusCode: 403,
          error: "Forbidden"
        });
    }

    const data = {
      userId: req.userData.userId,
      keyDescription: req.body.keyDescription,
    };
    const UserKey = await createKey(data);
    const userKeyData = UserKey.data;
    if (userKeyData){
      return res
        .status(200)
        .json({
          message: "Key generated successfully!",
          statusCode: 200,
          error: "OK",
          data: userKeyData
        });
    }
  }
  catch (err){
    console.log("Location: generateKey controller", err);
    throw err;
  }
}

module.exports = {
  generateKey,
};