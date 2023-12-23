const UserToken = require("../models/UserToken");
const { UserTokenTypes } = require("../utils/constants");
const { UserTokenCollection } = require("../utils/firestore");

/**
 * Creates user token in "UserTokens" collection
 * @param {string} userId - userId associate with token
 **/
async function createForgotToken(userId) {
  try {
    const result = await UserTokenCollection.add(
      UserToken.createUserToken({ userId, type: UserTokenTypes.FORGOT }),
    );

    const createdToken = await result.get();
    if (!createdToken.exists) {
      return null;
    }

    return new UserToken({
      ...createdToken.data(),
      userTokenRef: createdToken.ref,
    });
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
  try {
    const newUserToken = UserToken.createUserToken({
      userId,
      type: UserTokenTypes.VERIFY,
    });
    const result = await UserTokenCollection.doc(newUserToken.userTokenId).set(newUserToken);

    if (!result) return null;

    return new UserToken(newUserToken);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function fetchTokenFromId(token) {
  try {
    const tokenSnapshot = await UserTokenCollection.where("token", "==", token).limit(1).get();

    if(tokenSnapshot.empty)
      return null;

    const userTokenDoc = tokenSnapshot.docs[0];
    return new UserToken({...userTokenDoc.data(), userTokenRef: userTokenDoc.ref});
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  createForgotToken,
  deleteUserToken,
  createVerifyToken,
  fetchTokenFromId
};
