const bcrypt = require("bcrypt");
const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { fetchUserByEmail, updatePasswordbyUser } = require("../../services");

const updatePasswordPayloadSchema = Joi.object().keys({
  currPassword: Joi.string().trim().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().trim().required().min(8).max(30).messages({
    "string.base": "New password must be string",
    "string.min": "New password must be at least 8 characters",
    "string.max": "New password must be 30 characters or fewer",
    "any.required": "New password is required",
  }),
  confirmPassword: Joi.any().required().equal(Joi.ref("newPassword")).messages({
    "any.only": "Password and confirm password do not match",
  }),
});

async function updatePasswordController(req, res, next) {
  try {
    const { error, value } = updatePasswordPayloadSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }

    const { currPassword, newPassword } = value;
    const { email } = req.userData;
    const user = await fetchUserByEmail(email);

    const matchPassword = await user.matchPassword(currPassword);
    if (!matchPassword) {
      return res.status(400).json({
        message: "Current password is incorrect",
        statusCode: 400,
        error: STATUS_CODES[400],
      });
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 10);
    const result = await updatePasswordbyUser(user, hashNewPassword);
    if (result) {
      return res.status(200).json({
        message: "Password updated successfully",
        statusCode: 200,
      });
    } else {
      return res.status(500).json({
        message: "Unexpected error occured while updating password",
        statusCode: 500,
        error: STATUS_CODES[500],
      });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = updatePasswordController;
