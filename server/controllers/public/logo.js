const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { fetchImageByCompanyFree } = require("../../services");

const getLogoQuerySchema = Joi.object({
  domain: Joi.string()
    .regex(/^[A-Za-z0-9&-/:.]+$/)
    .required().messages({
      "any.required": "Domain is required",
      "string.pattern.base": "Invalid domain",
    })
});

async function demoLogoController(req, res, next) {
  try {
    const { error, value } = getLogoQuerySchema.validate(req.query);
    if (!!error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }

    const { domain } = value;

    let company = domain.replace(/.+\/\/|www.|\..+/g, "").toLowerCase();
    const imageUrl = await fetchImageByCompanyFree(company);
    if (!imageUrl) {
      return res.status(404).json({
        message: "Logo not available",
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: imageUrl,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = demoLogoController;
