const Joi = require("joi");
const { ALLOWED_IMAGE_EXTENSIONS } = require("../utils/constants");

const getLogoQuerySchema = Joi.object({
  key: Joi.string()
    .regex(/^[A-Za-z0-9&:.-/]+$/)
    .required()
    .messages({
      "any.required": "key is required",
      "string.pattern.base": "Invalid key",
    }),
  API_KEY: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "any.required": "API key is required",
  }),
}).custom((value, helpers) => {
  const { key } = value;
  const company = key
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/(\.[A-Za-z]{2,})+$/, "")
    .toUpperCase();
  if (company == "") {
    return helpers.error("key cannot be empty");
  }
  return { ...value, company };
});

const getSearchQuerySchema = Joi.object({
  key: Joi.string()
    .regex(/^[A-Za-z0-9&-/:.]+$/)
    .required()
    .messages({
      "any.required": "key is required",
      "string.pattern.base": "Invalid key",
    }),
  API_KEY: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "any.required": "API key is required",
  }),
}).custom((value, helpers) => {
  const { key } = value;
  const companyNameBeginsWith = key
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .match(/([A-Za-z0-9-]+)/)[1]
    .toUpperCase();
  if (companyNameBeginsWith === "") {
    return helpers.error("key cannot be empty");
  }
  return { ...value, companyNameBeginsWith };
});

const getDemoSearchQuerySchema = Joi.object({
  key: Joi.string()
    .regex(/^[A-Za-z0-9&/:.-]+$/)
    .required()
    .messages({
      "any.required": "key is required",
      "string.pattern.base": "Invalid key",
    }),
}).custom((value, helpers) => {
  const { key } = value;
  const companyNameBeginsWith = key
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .match(/([A-Za-z0-9-]+)/)[1]
    .toUpperCase();
  if (companyNameBeginsWith === "") {
    return helpers.error("key cannot be empty");
  }
  return { ...value, companyNameBeginsWith };
});

const imageExtensionSchema = Joi.string()
  .required()
  .lowercase()
  .valid(...ALLOWED_IMAGE_EXTENSIONS)
  .messages({
    "any.required": "extension is required",
    "any.only": `extension must be one of ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`,
  });

const companyUrlSchema = Joi.string()
  .required()
  .regex(/:\/\/[0-9a-z-.]+\.[a-z]+\//i)
  .uri({
    scheme: [/https?/],
  })
  .messages({
    "any.required": "companyUrl is required",
    "string.pattern.base": "Invalid companyUrl",
  });

module.exports = {
  getLogoQuerySchema,
  getSearchQuerySchema,
  companyUrlSchema,
  getDemoSearchQuerySchema,
  imageExtensionSchema,
};
