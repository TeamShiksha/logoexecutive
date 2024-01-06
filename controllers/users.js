const bcrypt = require("bcrypt");
const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { fetchUserByEmail, fetchUserFromId, updatePasswordService } = require("../services/User");
const {fetchSubscriptionByuserid} = require("../services/Subscription");
const {fetchKeyByuserid} = require("../services/Key");

async function getUser(req, res, next) {
  try {
    const {userId} = req.userData;

    const userData = await fetchUserFromId(userId);
    if (!userData) {
      return res
        .status(404)
        .json({
          statusCode: 404,
          error: STATUS_CODES[404],
          message: "User document not found",
        });
    }

    const subscriptionData = await fetchSubscriptionByuserid(userId);
    if (!subscriptionData) {
      return res
        .status(404)
        .json({
          statusCode: 404,
          error: STATUS_CODES[404],
          message: "Subscription document of user not found",
        });
    }
    userData.subscription = {...subscriptionData};
    console.log(userData.subscription);

    const keyData = await fetchKeyByuserid(userId);
    if (!keyData) {
      return res
        .status(404)
        .json({
          statusCode: 404,
          error: STATUS_CODES[404],
          message: "Key document of user not found",
        });
    }
    const keysToRemove = ["keyId", "userId", "updatedAt"];
    const filteredKeyData = keyData.map((keyObject) => {
      keysToRemove.forEach((keyToRemove) => {
        delete keyObject[keyToRemove];
      });
      return keyObject;
    });

    console.log(filteredKeyData);
    userData.key = {...filteredKeyData};

    const result = {
      "email": userData.email,
      "firstName": userData.firstName,
      "lastName": userData.lastName,

      "subscriptionId": userData.subscription.subscriptionId,
      "subscriptionType":userData.subscription.subscriptionType,
      "keyLimit": userData.subscription.keyLimit,
      "usageLimit": userData.subscription.usageLimit,

      "allKey": userData.key
    };

    return res
      .status(200)
      .json({
        statusCode: 200,
        success: STATUS_CODES[200],
        data: result
      });
  } 
  catch (err) {
    throw err;
  }
}

const updatePasswordPayloadSchema = Joi.object().keys({
  currPassword: Joi.string()
    .trim()
    .required()
    .min(8)
    .max(30)
    .message("Current password is not valid"),

  newPassword: Joi.string()
    .trim()
    .required()
    .min(8)
    .max(30)
    .message("New password has invalid format"),

  confirmPassword: Joi.any()
    .required()
    .equal(Joi.ref("newPassword"))
    .messages({
      "any.only": "confirmPassword does not match newPassword",
    }),
});

async function updatePassword(req, res){
  try{
    const {payload} = req.body;
    const {error, value} = updatePasswordPayloadSchema.validate(payload);
    if (error){
      return res
        .status(422)
        .json({
          message: error.message,
          statusCode: 422,
          error: "Unprocessable payload",
        });
    }

    const {currPassword} = req.body.payload;
    const {email} = req.userData;
    const user = await fetchUserByEmail(email);

    const matchPassword = await user.matchPassword(currPassword);
    if (!matchPassword){
      return res
        .status(400)
        .json({
          message: "Current Password is incorrect",
          statusCode: 400,
          error: "Bad request",
        });
    }

    const {newPassword} = req.body.payload;
    const hashNewPassword = await bcrypt.hash(newPassword, 10);

    const result = updatePasswordService(user, hashNewPassword);
    if (result){
      return res
        .status(200)
        .json({
          message: "Password updated successfully",
          statusCode: 200,
          error: "OK"
        });
    }
    else{
      return res
        .status(500)
        .json({
          message: "Unexpected error occured while updating password",
          statusCode: 500,
          error: "Internal server error",
        });
    }
  }
  catch(err){
    console.log("Location: updatePassword controller", err);
    throw err;
  }
}

module.exports = {
  getUser,
  updatePassword,
};
