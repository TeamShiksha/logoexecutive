const Joi = require("joi");
const { STATUS_CODES } = require("http");
const fs = require("fs");
const handlebars = require("handlebars");
const { fetchUserByEmail, createForgotToken } = require("../../services");
const { sendEmail } = require("../../utils/sendEmail");

const forgotPasswordSchema = Joi.object().keys({
  email: Joi.string()
    .trim()
    .required()
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .messages({
      "string.base": "Email must be string",
      "any.required": "Email is required",
      "string.pattern.base": "Invalid email",
    }),
});

async function forgotPasswordController(req, res, next) {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error)
      return res.status(422).json({
        error: STATUS_CODES[422],
        message: error.message,
        statusCode: 422,
      });

    const { email } = value;
    const user = await fetchUserByEmail(email);
    if (!user)
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: "Email does not exist",
        statusCode: 404,
      });
    const userToken = await createForgotToken(user._id.toString());
    if (!userToken)
      return res.status(503).json({
        error: STATUS_CODES[503],
        message: "Unable to process forgot password request",
        statusCode: 503,
      });

    const htmlFile = fs.readFileSync(
      __dirname + "/../../templates/ForgotPasswordOrVerify.html",
      "utf-8"
    ).toString();
    const template = handlebars.compile(htmlFile);
    const replacements = {
      url: userToken.tokenURL(),
      highlighted_text: "It seems like you forgot your password?",
      text: "Please click on the following link to reset your password"
    };
    const htmlBody = template(replacements);
    const nodeMailerRes = await sendEmail(user.email,  "Change Password", htmlBody);
    if (!nodeMailerRes.success)
      return res.status(500).json({
        error: STATUS_CODES[500],
        message: "Failed to send email",
        statusCode: 500,
      });

    return res.status(200).json({
      statusCode: 200,
      message:
        "Please check your email for a password reset link. If it's not there, check your spam folder",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = forgotPasswordController;
