const { isAPIKeyPresent } = require("../services/Key");
const { fetchImageByCompanyFree } = require("../services/Logo");
const { STATUS_CODES } = require("http");
const Joi = require("joi");

const getLogoQuerySchema = Joi.object({
  companyName: Joi.string().regex(/^[A-Za-z0-9&-]+$/).required(),
  apiKey: Joi.string().guid({ version: "uuidv4" }).required()
});


async function getLogo(req, res, next) {
  try{

    const { error, value } = getLogoQuerySchema.validate(req.query);

    // Check if Company name is present in the Query
    if (error) {
      return res.status(422).json({
        message: "Please provide proper Company name and API Key",
        statusCode: 422,
        error: STATUS_CODES[422]
      });
    }

    const { companyName, apiKey } = value;

    // Check if Keys are present for the given User
    const { userId } = req.userData;
    const apiKeyPresent = await isAPIKeyPresent(userId, apiKey);
    if (!apiKeyPresent) {
      return res.status(403).json({
        message: "Given API key was not found for User",
        statusCode: 403,
        error: STATUS_CODES[403]
      });
    }

    // Check if image is present for the given company in Firestore
    const imageUrl = await fetchImageByCompanyFree(companyName.toLowerCase());
    if (!imageUrl) {
      return res.status(404).json({
        message: "No image found for company name " + companyName,
        statusCode: 404,
        error: STATUS_CODES[404]
      });
    }

    return res.status(200).json({
      message: "Image Link successfully generated for " + companyName,
      statusCode: 200,
      data: imageUrl
    });
  }
  catch(err) {
    console.log(err);
    next(err);
  }
}

module.exports = { getLogo };