const bcrypt = require("bcrypt");
const Joi = require("joi");
const { STATUS_CODES } = require("http");
const {
  fetchUserByEmail,
  updatePasswordService,
} = require("../../services");


const updatePasswordPayloadSchema = Joi.object().keys({
  currPassword: Joi.string()
    .trim()
    .required()
    .min(8)
    .max(30)
    .message("Current password is not valid"),
  
  newPassword: Joi.string()
    .trim()
    .required()
    .min(8)
    .max(30)
    .message("New password has invalid format"),
  
  confirmPassword: Joi.any().required().equal(Joi.ref("newPassword")).messages({
    "any.only": "confirmPassword does not match newPassword",
  }),
});

async function updatePasswordController(req, res) {
  try {
    const { payload } = req.body;
    const { error, value } = updatePasswordPayloadSchema.validate(payload);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }
  
    const { currPassword } = req.body.payload;
    const { email } = req.userData;
    const user = await fetchUserByEmail(email);
  
    const matchPassword = await user.matchPassword(currPassword);
    if (!matchPassword) {
      return res.status(400).json({
        message: "Current Password is incorrect",
        statusCode: 400,
        error: STATUS_CODES[400],
      });
    }
  
    const { newPassword } = req.body.payload;
    const hashNewPassword = await bcrypt.hash(newPassword, 10);
  
    const result = updatePasswordService(user, hashNewPassword);
    if (result) {
      return res.status(200).json({
        message: "Password updated successfully",
        statusCode: 200,
        error: "OK",
      });
    } else {
      return res.status(500).json({
        message: "Unexpected error occured while updating password",
        statusCode: 500,
        error: "Internal server error",
      });
    }
  } catch (err) {
    console.log("Location: updatePassword controller", err);
    throw err;
  }
}

module.exports = updatePasswordController;