const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { setUserAdmin } = require("../../services");

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

const addAdminController = async (req, res, next) => {
  try {
    const email = req.body.email;
    const { error } = addAdminSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        statusCode: 422,
        message: error.message,
        error: STATUS_CODES[422],
      });
    }

    const response = await setUserAdmin(email);
    if (!response) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        error: STATUS_CODES[404],
      });
    }

    if (!response.isNewAdmin) {
      return res.status(204).json();
    }
    return res.status(200).json({
      statusCode: 200,
      message: "The user has been granted admin privileges",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = addAdminController;
