const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { fetchImageByCompanyFree } = require("../../services");
const { updateApiUsageCount } = require("../../services/Subscriptions");
const { Images, Keys, Subscriptions } = require("../../models/index");

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
    if(companyNameBeginsWith === "") {
      return res.status(422).json({
        message: "domainKey URL cannot be empty",
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }

    const userWithSubscription = await Keys.aggregate([
      { $match: { key: API_KEY } },
      {
        $lookup: {
          from: "subscriptions",
          localField: "user",
          foreignField: "user",
          as: "subscriptionDetails",
        },
      },
      { $unwind: "$subscriptionDetails" },
    ]);

    if (userWithSubscription.length === 0) {
      return res.status(403).json({
        message: "Invalid API key",
        statusCode: 403,
        error: STATUS_CODES[403],
      });
    }

    const { subscriptionDetails } = userWithSubscription[0];
    if (subscriptionDetails.usageCount >= subscriptionDetails.usageLimit) {
      return res.status(403).json({
        message: "Limit reached. Consider upgrading your plan",
        statusCode: 403,
        error: STATUS_CODES[403],
      });
    }

    const regexPattern = new RegExp(`^${companyNameBeginsWith}`, "i");
    const companyList = await Images.find({
      domainame: { $regex: regexPattern }
    });

    if (companyList.length === 0) {
      return res.status(404).json({
        message: "No companies found matching the provided domain key.",
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    }

    const dataList = [];
    for(const company of companyList){
      const signedUrl = await fetchImageByCompanyFree(company.domainame, undefined, false);

      if(!signedUrl) continue;

      dataList.push({
        companyName: company.domainame,
        image: signedUrl
      });
    }

    await Subscriptions.updateOne(
      { _id: subscriptionDetails._id },
      { $inc: { usageCount: 1 } }
    );
    
    return res.status(200).json({
      statusCode: 200,
      data: dataList,
    });
  } catch(err) {
    next(err);
  }
};

module.exports = searchLogoController;