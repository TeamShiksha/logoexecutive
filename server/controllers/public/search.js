const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { fetchImageByCompanyFree } = require("../../services");
const Images = require("../../models/Images");

const getSearchQuerySchema = Joi.object({
  domainKey: Joi.string()
    .regex(/^[A-Za-z0-9&-/:.]+$/)
    .required().messages({
      "any.required": "domainKey is required",
      "string.pattern.base": "Invalid domainKey",
    })
});

async function demoSearchLogoController(req, res, next) {
  try{
    const { error, value } = getSearchQuerySchema.validate(req.query);
    if (!!error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }

    const { domainKey } = value;
    let companyNameBeginsWith = domainKey.replace(/.+\/\/|www.|\..+/g, "").toUpperCase();

    const regexPattern = new RegExp(`^${companyNameBeginsWith}`, "i");
    const companyList = await Images.find({
      domainame: { $regex: regexPattern }
    });

    const companyListSorted = companyList.sort((a, b) => a.domainame.localeCompare(b.domainame));

    const dataList = [];
    for(const company of companyListSorted){
      const signedUrl = await fetchImageByCompanyFree(company.domainame);

      if(!signedUrl) continue;

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

module.exports = demoSearchLogoController;