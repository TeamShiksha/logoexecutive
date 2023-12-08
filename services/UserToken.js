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

module.exports = {
  createForgotToken,
  deleteUserToken
};
