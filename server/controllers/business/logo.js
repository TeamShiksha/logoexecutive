const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { isAPIKeyPresent, fetchImageByCompanyFree } = require("../../services");

const getLogoQuerySchema = Joi.object({
  companyName: Joi.string()
    .regex(/^[A-Za-z0-9&-]+$/)
    .required(),
  apiKey: Joi.string().guid({ version: "uuidv4" }).required(),
});

async function getLogoController(req, res, next) {
  try {
    const { error, value } = getLogoQuerySchema.validate(req.query);
    if (error) {
      return res.status(422).json({
        message: "Please provide proper Company name and API Key",
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }

    const { companyName, apiKey } = value;
    const apiKeyPresent = await isAPIKeyPresent(apiKey);
    if (!apiKeyPresent) {
      return res.status(403).json({
        message: "Given API key was not found",
        statusCode: 403,
        error: STATUS_CODES[403],
      });
    }

    const imageUrl = await fetchImageByCompanyFree(companyName.toLowerCase());
    if (!imageUrl) {
      return res.status(404).json({
        message: "No image found for company name " + companyName,
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    }

    return res.status(200).json({
      message: "Image Link successfully generated for " + companyName,
      statusCode: 200,
      data: imageUrl,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = getLogoController;
