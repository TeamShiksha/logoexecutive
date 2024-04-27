const Joi = require("joi");
const { STATUS_CODES } = require("http");
const {
  fetchUserByEmail,
  updateUser,
  createVerifyToken,
} = require("../../services");
const { sendEmail } = require("../../utils/sendEmail");

const changeNameEmailSchema = Joi.object().keys({
  firstName: Joi.string()
    .trim()
    .required()
    .min(1)
    .max(20)
    .regex(/^[^!@#$%^&*(){}\[\]\\\.;'",.<>/?`~|0-9]*$/)
    .messages({
      "string.base": "First name must be string",
      "string.min": "First name cannot be empty",
      "string.max": "First name length must be 20 or fewer",
      "any.required": "First name is required",
      "string.pattern.base": "First name should only contain alphabets",
    }),
  lastName: Joi.string()
    .trim()
    .required()
    .min(1)
    .max(20)
    .regex(/^[^!@#$%^&*(){}\[\]\\\.;'",.<>/?`~|0-9]*$/)
    .messages({
      "string.base": "Last name must be string",
      "string.min": "Last name cannot be empty",
      "string.max": "Last name must be 20 or fewer characters",
      "any.required": "Last name is required",
      "string.pattern.base": "Last name should only contain alphabets",
    }),
});

async function updateProfileController(req, res, next) {
  try {
    const { firstName, lastName } = req.body;
    const { error } = changeNameEmailSchema.validate(req.body);
    if (!!error) {
      return res.status(422).json({
        statusCode: 422,
        message: error.message,
        error: STATUS_CODES[422],
      });
    }

    const user = await fetchUserByEmail(req.userData.email);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: "User not found",
      });
    }

    const profileupdated = await updateUser({ firstName, lastName }, user);
    if (!profileupdated) {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to update profile",
        error: STATUS_CODES[500],
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = updateProfileController;
