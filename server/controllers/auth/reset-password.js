const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { STATUS_CODES } = require("http");
const { fetchTokenFromId, deleteUserToken, 
  updatePasswordService, fetchUserFromId } = require("../../services");

const payloadSchema = Joi.object().keys({
  token: Joi.string().required()
});

async function get(req, res, next) {
  try {
    const { error, value } = payloadSchema.validate(req.query);

    if(error)
      return res.status(422).json({
        error: STATUS_CODES[422],
        message: error.message,
        statusCode: 422
      });

    const userToken = await fetchTokenFromId(value.token);
    if(!userToken)
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: "User Token not found",
        statusCode: 404
      });

    if(userToken.isExpired())
      return res.status(403).json({
        error: STATUS_CODES[403],
        message: "User Token is expired",
        statusCode: 403,
      });

    res.cookie("resetPasswordSession", jwt.sign({ userId: userToken.userId, token: userToken.token }, process.env.JWT_SECRET));
		
    const redirectURL = new URL("/reset-password", process.env.BASE_URL);
    redirectURL.searchParams.append("token", userToken.token);

    return res.redirect(302, redirectURL.href);
  } catch (err) {
    next(err);
  }
}


const patchSchema = Joi.object().keys({
  newPassword: Joi.string().trim().min(8).max(30).required(),
  confirmPassword: Joi.string().trim().min(8).max(30).required(),
  token: Joi.string().trim().required(),
});

const patch = async (req, res, next) => {
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

    const decodedData = jwt.verify(
      resetPasswordSession,
      process.env.JWT_SECRET
    );
    const { userId } = decodedData;
    const { error, value } = patchSchema.validate(result);

    if (error) {
      return res.status(422).json({
        error: STATUS_CODES[422],
        message: error.message,
        statusCode: 422
      });
    }

    if (value.confirmPassword === value.newPassword) {
      const hashedPassword = await bcrypt.hash(value.newPassword, 10);
      const userRef = await fetchUserFromId(userId);
      const result = await updatePasswordService(userRef, hashedPassword);
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
        return res
          .status(200)
          .json({ message: "Your password has been updated successfully." });
      } else {
        return res.status(400).json({
          error: STATUS_CODES[400],
          message: "Failed to update password",
          statusCode: 400,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};


module.exports = { get, patch };
