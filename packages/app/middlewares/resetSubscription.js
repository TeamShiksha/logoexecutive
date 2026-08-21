const { KeyService, SubscriptionService } = require("../services");
const { Messages } = require("../utils/constants");
const { STATUS_CODES } = require("http");

const resetSubscription = async (req, res, next) => {
  try {
    const { key, API_KEY } = req.query;

    if (!key || !API_KEY) {
      return res.status(422).json({
        message: "API_KEY and  key both are required",
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }
    const keyRef = new KeyService();
    const subscriptionService = new SubscriptionService();
    const keyVal = await keyRef.getApiKey(API_KEY);
    if (!keyVal) {
      return res.status(403).json({
        message: Messages.INVALID_KEY,
        statusCode: 403,
        error: STATUS_CODES[403],
      });
    }

    if (
      !keyVal.expires_at ||
      keyVal.expires_at === null ||
      keyVal.expires_at === undefined
    ) {
      return res.status(403).json({
        message: Messages.UPDATE_API_KEY,
        error: STATUS_CODES[403],
        statusCode: 403,
      });
    }

    if (keyVal.expires_at && new Date() > new Date(keyVal.expires_at)) {
      return res.status(403).json({
        message: Messages.API_KEY_EXPIRED,
        statusCode: 403,
        error: STATUS_CODES[403],
      });
    }
    let subscriptionData = await subscriptionService.getSubscription(
      keyVal.subscription_id
    );
    const currentDate = new Date();
    if (
      !subscriptionData.start_date ||
      !subscriptionData.end_date ||
      new Date(currentDate) > new Date(subscriptionData.end_date)
    ) {
      await subscriptionService.resetLimitAndExpiryDate(subscriptionData._id);
      subscriptionData = await subscriptionService.getSubscription(
        keyVal.subscription_id
      );
    }
    if (subscriptionData.usage_count >= subscriptionData.usage_limit) {
      return res.status(403).json({
        message: Messages.LIMIT_REACHED,
        statusCode: 403,
        error: STATUS_CODES[403],
      });
    }
    req.keyRef = keyVal;
    req.subscriptionData = subscriptionData;
    req.subscriptionService = subscriptionService;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = resetSubscription;
