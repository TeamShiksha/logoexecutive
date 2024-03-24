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

    const data = {};

    const [subscriptionData, userKeys] = await Promise.allSettled([fetchSubscriptionByuserid(userId), fetchKeysByuserid(userId)]);

    Object.assign(data, user.data);

    let statusCode = 200;
    if(subscriptionData.status === "fulfilled" && subscriptionData.value) {
      Object.assign(data, { subscription: subscriptionData.value.data });
    } else {
      statusCode = 206;
    }
    if(userKeys.status === "fulfilled" && userKeys.value) {
      Object.assign(data, { keys: userKeys.value.map(key => key.data) });
    } else {
      statusCode = 206;
    }

    return res.status(statusCode).json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports =  getUserDataController;
