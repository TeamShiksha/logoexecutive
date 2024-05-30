const { UserToken } = require("../models");
const { UserTokenTypes } = require("../utils/constants");
const { UserTokenCollection } = require("../utils/firestore");

/**
 * Creates user token in "UserTokens" collection
 * @param {string} userId - userId associate with token
 **/
async function createForgotToken(userId) {
  try {
    const newUserForgotToken = await UserToken.NewUserToken({userId,type:UserTokenTypes.FORGOT});
    const result = await UserTokenCollection.doc(
      newUserForgotToken.userTokenId
    ).set(newUserForgotToken);
    if (!result) return null;
    return new UserToken(newUserForgotToken);
  } catch (err) {
    throw err;
  }
}

/**
 * Deletes the userToken document in firestore
 * @param {UserToken} userToken
 **/
async function deleteUserToken(userToken) {
  const result = await userToken.userTokenRef.delete();
  if (!result) return false;
  return true;
}

/**
 * Creates user token with type Verify in "UserTokens" collection
 * @param {string} userId - userId associate with token
 **/
async function createVerifyToken(userId) {
  try {
    const newUserVerifyToken = await UserToken.NewUserToken({userId,type:UserTokenTypes.VERIFY});
    const result = await UserTokenCollection.doc(
      newUserVerifyToken.userTokenId
    ).set(newUserVerifyToken);
    if (!result) return null;
    return new UserToken(newUserVerifyToken);
  } catch (err) {
    throw err;
  }
}

async function fetchTokenFromId(token) {
  try {
    const tokenSnapshot = await UserTokenCollection.where("token", "==", token)
      .limit(1)
      .get();
    if (tokenSnapshot.empty) return null;
    const userTokenDoc = tokenSnapshot.docs[0];
    return new UserToken({
      ...userTokenDoc.data(),
      userTokenRef: userTokenDoc.ref,
    });
  } catch (err) {
    throw err;
  }
}

async function fetchTokenFromUserid(userid) {
  try {
    let getTokenDoc = null;
    const userTokenRef = await UserTokenCollection.where(
      "userId",
      "==",
      userid
    ).get();

    userTokenRef.forEach((doc) => {
      getTokenDoc = { ...doc.data(), userTokenRef: doc.ref };
    });
    return getTokenDoc;
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
