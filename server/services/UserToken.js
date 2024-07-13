const { UserToken } = require("../models");
const { UserTokenTypes } = require("../utils/constants");

/**
 * Creates user token in "UserTokens" collection
 * @param {string} userId - userId associated with the token
 **/
async function createForgotToken(userId) {
  try {
    const newUserForgotToken = UserToken.NewUserToken({ userId, type: UserTokenTypes.FORGOT });
    const createdToken = new UserToken(newUserForgotToken);
    const result = await createdToken.save();
    if (!result) return null;
    return createdToken;
  } catch (err) {
    throw err;
  }
}

/**
 * Deletes the userToken document in MongoDB
 * @param {UserToken} userToken
 **/
async function deleteUserToken(userToken) {
  try {
    const result = await UserToken.findByIdAndDelete(userToken._id);
    return result !== null;
  } catch (err) {
    throw err;
  }
}

/**
 * Creates user token with type Verify in "UserTokens" collection
 * @param {string} userId - userId associated with the token
 **/
async function createVerifyToken(userId) {
  try {
    const newUserVerifyToken = UserToken.NewUserToken({ userId, type: UserTokenTypes.VERIFY });
    const createdToken = new UserToken(newUserVerifyToken);
    const result = await createdToken.save();
    if (!result) return null;
    return createdToken;
  } catch (err) {
    throw err;
  }
}

/**
 * Fetches a user token from MongoDB by token value
 * @param {string} token - token value
 **/
async function fetchTokenFromId(token) {
  try {
    const userTokenDoc = await UserToken.findOne({ token }).exec();
    if (!userTokenDoc) return null;
    return userTokenDoc;
  } catch (err) {
    throw err;
  }
}

/**
 * Fetches a user token from MongoDB by userId
 * @param {string} userId - userId value
 **/
async function fetchTokenFromUserid(userId) {
  try {
    const userTokenDoc = await UserToken.findOne({ userId }).exec();
    return userTokenDoc;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createForgotToken,
  deleteUserToken,
  createVerifyToken,
  fetchTokenFromId,
  fetchTokenFromUserid,
};
