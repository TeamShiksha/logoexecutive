const Joi = require("joi");
const { STATUS_CODES } = require("http");
const {
  fetchUserByEmail,
  updateUser,
  createVerifyToken,
} = require("../../services");
const { sendEmail } = require("../../utils/sendEmail");
const bcrypt = require("bcrypt");

const changeNameEmailSchema = Joi.object()
  .keys({
    firstName: Joi.string()
      .trim()
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
    oldPassword: Joi.string().trim().messages({
      "any.required": "Old password is required",
    }),
    newPassword: Joi.string().trim().min(8).max(30).messages({
      "string.base": "New password must be string",
      "string.min": "New password must be at least 8 characters",
      "string.max": "New password must be 30 characters or fewer",
      "any.required": "New password is required",
    }),
  })
  .and("oldPassword", "newPassword")
  .or("firstName", "lastName", "newPassword");

async function updateProfileController(req, res, next) {
  try {
    const { firstName, lastName, oldPassword, newPassword } = req.body;
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
    let payload = {};
    if (oldPassword && newPassword) {
      const matchPassword = await user.matchPassword(oldPassword);
      if (!matchPassword) {
        return res.status(401).json({
          error: STATUS_CODES[401],
          message: "Incorrect password",
          statusCode: 401,
        });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      payload = {
        password: hashedPassword,
      };
    }
    payload = {
      ...payload,
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    };
    const profileupdated = await updateUser(payload, user);
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
