const { STATUS_CODES } = require("http");
const { fetchUserFromId, fetchSubscriptionByuserid, 
  fetchKeysByuserid } = require("../../services");

async function getUserDataController(req, res, next) {
  try {
    const { userId } = req.userData;
    const user = await fetchUserFromId(userId);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: "User document not found",
      });
    }
    const userData = { ...user };
    const subscriptionData = await fetchSubscriptionByuserid(userId);
    if (!subscriptionData) {
      return res.status(404).json({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: "Subscription document of user not found",
      });
    }
    userData.subscription = { ...subscriptionData };
    const keyData = await fetchKeysByuserid(userId);
    const keysToRemove = ["keyId", "userId", "updatedAt"];
    let filteredKeyData = null;
    if (keyData) {
      filteredKeyData = keyData.map((keyObject) => {
        keysToRemove.forEach((keyToRemove) => {
          delete keyObject[keyToRemove];
        });
        return keyObject;
      });
    }
    userData.key = { ...filteredKeyData };
    const result = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      subscriptionId: userData.subscription.subscriptionId,
      subscriptionType: userData.subscription.subscriptionType,
      usageLimit: userData.subscription.usageLimit,
      isActive: userData.subscription.isActive,
      keys: userData.key,
    };

    return res.status(200).json({
      statusCode: 200,
      success: STATUS_CODES[200],
      data: result,
    });
  } catch (err) {
    throw err;
  }
}

module.exports =  getUserDataController;
