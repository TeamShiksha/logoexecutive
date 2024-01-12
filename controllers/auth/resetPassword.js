const Joi = require("joi");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const http = require("http");
const {
  fetchUserFromId,
  updatePasswordService,
} = require("../../services/User");
const {
  fetchTokenFromId,
  deleteUserToken,
} = require("../../services/UserToken");

const resetPasswordPayloadSchema = Joi.object().keys({
  newPassword: Joi.string().trim().min(8).max(30).required(),
  confirmPassword: Joi.string().trim().min(8).max(30).required(),
  token: Joi.string().trim().required(),
});

const resetPasswordController = async (req, res, next) => {
  try {
    const result = req.body;
    const { resetPasswordSession } = req.cookies;

    if (!resetPasswordSession) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not signed in",
        statusCode: 401,
      });
    }

    const decodedData = JWT.verify(
      resetPasswordSession,
      process.env.JWT_SECRET
    );
    const { userId } = decodedData;
    const { error, value } = resetPasswordPayloadSchema.validate(result);

    if (error) {
      return res.status(402).json({ message: error.message });
    }

    if (value.confirmPassword === value.newPassword) {
      const hashedPassword = await bcrypt.hash(value.newPassword, 10);
      const userRef = await fetchUserFromId(userId);
      const result = await updatePasswordService(userRef, hashedPassword);
      if (result) {
        let deleteTokenRef = await fetchTokenFromId(value.token);
        if (deleteTokenRef === null || deleteTokenRef.token !== value.token) {
          return res.status(403).json({
            error: http.STATUS_CODES[403],
            message: "Invalid credentials",
            statusCode: 403,
          });
        }
        await deleteUserToken(deleteTokenRef);
        return res
          .status(200)
          .json({ message: "Password updated Successfully" });
      } else {
        return res.status(400).json({
          error: http.STATUS_CODES[400],
          message: "Failed to update password",
          statusCode: 400,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = resetPasswordController;
