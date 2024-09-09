const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { isAPIKeyPresent, fetchImageByCompanyFree } = require("../../services");
const { updateApiUsageCount, isApiUsageLimitExceed } = require("../../services/Subscriptions");
const { fetchUserByApiKey } = require("../../services/Keys");
const Images = require("../../models/Images");

const getSearchQuerySchema = Joi.object({
  domainKey: Joi.string()
    .regex(/^[A-Za-z0-9&-/:.]+$/)
    .required().messages({
      "any.required": "domainKey is required",
      "string.pattern.base": "Invalid domainKey",
    }),
  API_KEY: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "any.required": "API key is required"
  }),
});

async function searchLogoController(req, res, next) {
  try{
    const { error, value } = getSearchQuerySchema.validate(req.query);
    if (!!error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }

    const { domainKey, API_KEY } = value;
    let companyNameBeginsWith = domainKey.replace(/.+\/\/|www.|\..+/g, "").toUpperCase();

    const apiKeyPresent = await isAPIKeyPresent(API_KEY);
    if (!apiKeyPresent) {
      return res.status(403).json({
        message: "Invalid API key",
        statusCode: 403,
        error: STATUS_CODES[403],
      });
    }

    const userId =await fetchUserByApiKey(API_KEY);
    const isExceed = await isApiUsageLimitExceed(userId);
    if(isExceed){
      return res.status(403).json({
        message: "Limit reached. Consider upgrading your plan",
        statusCode: 403,
        error: STATUS_CODES[403]
      });
    }

    const regexPattern = new RegExp(`^${companyNameBeginsWith}`, "i");
    const companyList = await Images.find({
      domainame: { $regex: regexPattern }
    });

    const dataList = [];
    for(const company of companyList){
      const signedUrl = await fetchImageByCompanyFree(company.domainame);

      dataList.push({
        companyName: company.domainame,
        image: signedUrl
      });
    }
    
    return res.status(200).json({
      statusCode: 200,
      data: dataList,
    });
  } catch(err) {
    next(err);
  }
};

module.exports = searchLogoController;