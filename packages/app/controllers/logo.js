const { STATUS_CODES } = require("http");
const {
  ImageService,
  KeyService,
  SubscriptionService,
  UserService,
} = require("../services");
const {
  getLogoQuerySchema,
  getSearchQuerySchema,
  getDemoSearchQuerySchema,
} = require("../schemas/catalog");
const { Messages } = require("../utils/constants");

/**
 * Handles requests for fetching a company's logo based on a domain and API key.
 * Validates input, checks subscription limits, fetches the logo, and updates API usage.
 */
async function getLogoController(req, res, next) {
  try {
    const imageService = new ImageService();
    const keyService = new KeyService();
    const subscriptionService = new SubscriptionService();
    const userService = new UserService();

    const { error, value } = getLogoQuerySchema.validate(req.query);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }
    const { company, API_KEY } = value;

    const keyRef = await keyService.getApiKey(API_KEY);
    if (!keyRef) {
      return res.status(403).json({
        message: Messages.INVALID_KEY,
        statusCode: 403,
        error: STATUS_CODES[403],
      });
    }
    const keysNeedUpdate =
      !keyRef.expires_at ||
      keyRef.expires_at === null ||
      keyRef.expires_at === undefined;

    if (keysNeedUpdate) {
      return res.status(403).json({
        message: Messages.UPDATE_API_KEY,
        error: STATUS_CODES[403],
        statusCode: 403,
      });
    }
    if (keyRef.expires_at && new Date() > new Date(keyRef.expires_at)) {
      return res.status(403).json({
        message: Messages.API_KEY_EXPIRED,
        statusCode: 403,
        error: STATUS_CODES[403],
      });
    }

    const userSubscription = await subscriptionService.getSubscription(
      keyRef.subscription_id
    );
    if (userSubscription.usage_count >= userSubscription.usage_limit) {
      return res.status(403).json({
        message: Messages.LIMIT_REACHED,
        statusCode: 403,
        error: STATUS_CODES[403],
      });
    }

    const imageUrl = await imageService.fetchImageByCompanyFree(company);
    if (!imageUrl) {
      return res.status(404).json({
        message: Messages.LOGO_NOT_FOUND,
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    }

    await userService.logLogoRequestEntry(company, userSubscription, keyRef);

    await subscriptionService.incrementUsageCount(userSubscription);
    return res.status(200).json({
      statusCode: 200,
      data: imageUrl,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handles logo search requests using a company name prefix and API key.
 * Validates input, checks subscription limits, fetches matching companies and their logos.
 * Responds with a list of logos.
 */
async function searchLogoController(req, res, next) {
  try {
    const imageServices = new ImageService();
    const keyService = new KeyService();
    const subscriptionService = new SubscriptionService();

    const { error, value } = getSearchQuerySchema.validate(req.query);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }
    const { API_KEY, companyNameBeginsWith } = value;
    const key = await keyService.getApiKey(API_KEY);

    if (!key) {
      return res.status(403).json({
        message: Messages.INVALID_KEY,
        error: STATUS_CODES[403],
        statusCode: 403,
      });
    }

    const keysNeedUpdate =
      !key.expires_at ||
      key.expires_at === null ||
      key.expires_at === undefined;

    if (keysNeedUpdate) {
      return res.status(403).json({
        message: Messages.UPDATE_API_KEY,
        error: STATUS_CODES[403],
        statusCode: 403,
      });
    }

    if (key.expires_at && new Date() > new Date(key.expires_at)) {
      return res.status(403).json({
        message: Messages.API_KEY_EXPIRED,
        statusCode: 403,
        error: STATUS_CODES[403],
      });
    }

    const subscription = await subscriptionService.getSubscription(
      key.subscription_id
    );
    if (subscription.usage_count >= subscription.usage_limit) {
      return res.status(403).json({
        message: Messages.LIMIT_REACHED,
        error: STATUS_CODES[403],
        statusCode: 403,
      });
    }

    const regexPattern = new RegExp(`^${companyNameBeginsWith}`, "i");
    const companyList = await imageServices.fetchCompanyList(regexPattern);
    if (companyList.length === 0) {
      return res.status(404).json({
        message: Messages.LOGO_NOT_FOUND,
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    }

    const dataList = await imageServices.getDataList(companyList);
    await subscriptionService.incrementUsageCount(subscription);

    return res.status(200).json({
      statusCode: 200,
      data: dataList,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handles logo search requests using a company name prefix for user demo.
 * Validates input, fetches matching companies and their logos.
 * Responds with a list of logos.
 */
async function demoSearchLogoController(req, res, next) {
  try {
    const imageServices = new ImageService();

    const { error, value } = getDemoSearchQuerySchema.validate(req.query);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }
    const { companyNameBeginsWith } = value;

    const regexPattern = new RegExp(`^${companyNameBeginsWith}`, "i");
    const companyList = await imageServices.fetchCompanyList(regexPattern);
    if (companyList.length === 0) {
      return res.status(404).json({
        message: Messages.LOGO_NOT_FOUND,
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    }

    const dataList = await imageServices.getDataList(companyList);

    return res.status(200).json({
      statusCode: 200,
      data: dataList,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLogoController,
  searchLogoController,
  demoSearchLogoController,
};
