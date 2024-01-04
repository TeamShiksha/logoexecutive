const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { fetchTokenFromId } = require("../../services/UserToken");
const jwt = require("jsonwebtoken");

const payloadSchema = Joi.object().keys({
  token: Joi.string().required()
});

async function getResetPasswordController(req, res, next) {
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

    res.cookie("reset-password-session", jwt.sign({ userId: userToken.userId, token: userToken.token }, process.env.JWT_SECRET));
		
    const redirectURL = new URL("/reset-password", process.env.CLIENT_URL);
    redirectURL.searchParams.append("userId", userToken.userId);
    redirectURL.searchParams.append("token", userToken.token);

    return res.redirect(301, redirectURL.href);
  } catch (err) {
    next(err);
  }
}

module.exports = getResetPasswordController;
