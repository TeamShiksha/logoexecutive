const { STATUS_CODES } = require("http");
const { ImageService, UserService } = require("../services");
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
    const userService = new UserService();

    const { error, value } = getLogoQuerySchema.validate(req.query);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }
    const { company } = value;
    const { keyRef, subscriptionData, subscriptionService } = req;
    const imageUrl = await imageService.fetchImageByCompanyFree(company);
    if (!imageUrl) {
      return res.status(404).json({
        message: Messages.LOGO_NOT_FOUND,
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    }

    const updatedUsageCount = await subscriptionService.incrementUsageCount(
      subscriptionData._id,
      subscriptionData.usage_limit
    );
    if (!updatedUsageCount) {
      return res.status(403).json({
        message: Messages.LIMIT_REACHED,
        statusCode: 403,
        error: STATUS_CODES[403],
      });
    }
    await userService.logLogoRequestEntry(company, subscriptionData, keyRef);
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

    const { error, value } = getSearchQuerySchema.validate(req.query);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }
    const { companyNameBeginsWith } = value;
    const { subscriptionData, subscriptionService } = req;

    const regexPattern = new RegExp(`^${companyNameBeginsWith}`, "i");
    const companyList = await imageServices.fetchCompanyList(regexPattern);
    if (companyList.length === 0) {
      return res.status(404).json({
        message: Messages.LOGO_NOT_FOUND,
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    }
    const updatedUsageCount = await subscriptionService.incrementUsageCount(
      subscriptionData._id
    );
    if (!updatedUsageCount) {
      return res.status(403).json({
        message: Messages.LIMIT_REACHED,
        statusCode: 403,
        error: STATUS_CODES[403],
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
