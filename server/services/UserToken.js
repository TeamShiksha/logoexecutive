const dayjs = require("dayjs");
const { UserToken } = require("../models");
const { Timestamp } = require("firebase-admin/firestore");
const { UserTokenTypes } = require("../utils/constants");
const { UserTokenCollection } = require("../utils/firestore");
const { v4 } = require("uuid");

/**
 * Creates user token in "UserTokens" collection
 * @param {string} userId - userId associate with token
 **/
async function createForgotToken(userId) {
  const expireAt = dayjs().add(1, "day").toDate();
  try {
    const newUserForgotToken = {
      userId: userId,
      type: UserTokenTypes.FORGOT,
      userTokenId: v4(),
      token: v4().replaceAll("-", ""),
      createdAt: Timestamp.now(),
      expireAt: Timestamp.fromDate(expireAt),
    };
    const result = await UserTokenCollection.doc(
      newUserForgotToken.userTokenId
    ).set(newUserForgotToken);
    if (!result) return null;
    return new UserToken(newUserForgotToken);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

/**
 * Deletes the userToken document in firestore
 * @param {UserToken} userToken
 **/
async function deleteUserToken(userToken) {
  const result = await userToken.userTokenRef.delete();
  if (!result)
    return {
      success: false,
      data: {
        message: "Failed to delete token",
      },
    };
  return {
    success: true,
    data: {
      message: "Successfully deleted token",
      data: result,
    },
  };
}

/**
 * Creates user token with type Verify in "UserTokens" collection
 * @param {string} userId - userId associate with token
 **/
async function createVerifyToken(userId) {
  const expireAt = dayjs().add(1, "day").toDate();
  try {
    const newUserVerifyToken = {
      userId: userId,
      type: UserTokenTypes.VERIFY,
      userTokenId: v4(),
      token: v4().replaceAll("-", ""),
      createdAt: Timestamp.now(),
      expireAt: Timestamp.fromDate(expireAt),
    };
    const result = await UserTokenCollection.doc(
      newUserVerifyToken.userTokenId
    ).set(newUserVerifyToken);
    if (!result) return null;
    return new UserToken(newUserVerifyToken);
  } catch (err) {
    console.log(err);
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
    console.log(err);
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
    console.log(err);
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
