const Joi = require("joi");

const addAdminSchema = Joi.object().keys({
  email: Joi.string()
    .trim()
    .required()
    .max(50)
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .messages({
      "string.base": "Email must be string",
      "string.max": "Email length must be 50 or fewer",
      "string.pattern.base": "Invalid email",
      "any.required": "Email is required",
    }),
});

const imageReuploadSchema = Joi.object().keys({
  id: Joi.string().trim().required().messages({
    "any.required": "Id is required",
  }),
});

const changeSubscriptionPlanSchema = Joi.object().keys({
  plan: Joi.string().valid("HOBBY", "PRO").required().messages({
    "any.only": "Plan must be one of: HOBBY, PRO",
    "any.required": "Plan is required",
  }),
  reason: Joi.string().trim().max(200).optional().messages({
    "string.max": "Reason must be 200 characters or fewer",
  }),
});

const listUsersQuerySchema = Joi.object({
  search: Joi.string().trim().max(100).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  includeDeleted: Joi.boolean().default(false),
  hasRewardPoints: Joi.boolean().default(false),
});

const listSubscriptionLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = {
  addAdminSchema,
  imageReuploadSchema,
  changeSubscriptionPlanSchema,
  listUsersQuerySchema,
  listSubscriptionLogsQuerySchema,
};
