const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { STATUS_CODES } = require("http");
const {
  fetchTokenFromId,
  deleteUserToken,
  updatePasswordbyUser,
  fetchUserFromId,
} = require("../../services");

const payloadSchema = Joi.object().keys({
  token: Joi.string().trim().required().messages({
    "any.required": "Token is required",
  }),
});

async function get(req, res, next) {
  try {
    const { error, value } = payloadSchema.validate(req.query);
    if (error)
      return res.status(422).json({
        error: STATUS_CODES[422],
        message: error.message,
        statusCode: 422,
      });

    const userToken = await fetchTokenFromId(value.token);
    if (!userToken)
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: "User Token not found",
        statusCode: 404,
      });

    if (userToken.isExpired())
      return res.status(403).json({
        error: STATUS_CODES[403],
        message: "Token expired",
        statusCode: 403,
      });

    res.cookie(
      "resetPasswordSession",
      jwt.sign(
        { userId: userToken.userId, token: userToken.token },
        process.env.JWT_SECRET
      )
    );
    return res.status(200).json({
      message: "Token is verified successfully",
    });
  } catch (err) {
    next(err);
  }
}

const patchSchema = Joi.object().keys({
  newPassword: Joi.string().trim().min(8).max(30).required().messages({
    "any.required": "New password is required",
    "string.max": "New password must be 30 characters or fewer",
    "string.min": "New password must be at least 8 characters",
  }),
  confirmPassword: Joi.string()
    .required()
    .equal(Joi.ref("newPassword"))
    .messages({
      "any.only": "Password and confirm password do not match",
      "any.required": "Confirm password is required",
    }),
  token: Joi.string().trim().required().messages({
    "string.base": "Token must be a string",
    "any.required": "Token is required",
  }),
});

const patch = async (req, res, next) => {
  try {
    const { resetPasswordSession } = req.cookies;
    if (!resetPasswordSession) {
      return res.status(401).json({
        error: STATUS_CODES[401],
        message: "User is not signed in",
        statusCode: 401,
      });
    }

    const decodedData = jwt.verify(
      resetPasswordSession,
      process.env.JWT_SECRET
    );
    const { userId } = decodedData;
    const { error, value } = patchSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        error: STATUS_CODES[422],
        message: error.message,
        statusCode: 422,
      });
    }

    const hashedPassword = await bcrypt.hash(value.newPassword, 10);
    const userRef = await fetchUserFromId(userId);
    const result = await updatePasswordbyUser(userRef, hashedPassword);
    if (result) {
      let deleteTokenRef = await fetchTokenFromId(value.token);
      if (deleteTokenRef === null || deleteTokenRef.token !== value.token) {
        return res.status(403).json({
          error: STATUS_CODES[403],
          message: "Invalid credentials",
          statusCode: 403,
        });
      }
      await deleteUserToken(deleteTokenRef);
      return res.status(200).json({
        message:
          "Your password has been successfully reset. You can now sign in with your new password.",
      });
    } else {
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: "Failed to update password",
        statusCode: 400,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { get, patch };
