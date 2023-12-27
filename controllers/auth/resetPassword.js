const Joi = require("joi");
const bcrypt = require("bcrypt");
const {
  fetchUserFromId,
  updatePasswordService,
} = require("../../services/User");
const {
  fetchTokenFromUserid,
  deleteUserToken,
} = require("../../services/UserToken");

const resetPasswordPayloadSchema = Joi.object().keys({
  newPassword: Joi.string().trim().min(8).max(30).required(),
  confirmPassword: Joi.string().trim().min(8).max(30).required(),
  userId: Joi.string().required(),
});

const resetPasswordController = async (req, res) => {
  try {
    const result = req.body;
    const { error, value } = resetPasswordPayloadSchema.validate(result);
    if (error) {
      return res.status(402).json({ message: error });
    }

    if (value) {
      if (value.confirmPassword === value.newPassword) {
        const hashedPassword = await bcrypt.hash(value.newPassword, 10);
        const userRef = await fetchUserFromId(value.userId);
        const result = await updatePasswordService(userRef, hashedPassword);
        if (result) {
          let deleteTokenRef = await fetchTokenFromUserid(value.userId);
          await deleteUserToken(deleteTokenRef);
          return res
            .status(200)
            .json({ message: "Password updated Successfully" });
        } else {
          return res.status(400).json({
            error: STATUS_CODES[400],
            message: "Failed to update password",
            statusCode: 400,
          });
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: STATUS_CODES[500],
      message: error,
      statusCode: 500,
    });
  }
};

module.exports = resetPasswordController;
