const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { fetchUserByEmail, createForgotToken } = require("../../services");
const { sendEmail } = require("../../utils/sendEmail");

const getHTMLBody = (url) =>{
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Forgot Password</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Lato:wght@700&family=Nunito&family=Poppins&display=swap"
          rel="stylesheet" />
      </head>

      <body style="margin: 0; padding: 0; font-family: Inter, Arial, sans-serif; box-sizing: border-box;">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background-color: #ffffff; max-width: 675px; margin: 0 auto; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 20px; background-color: #6b5b95;">
              <a href="https://logoexecutive.vercel.app/home"
                style="color: #ffffff; text-decoration: none; display: flex; align-items: center; justify-content: center;">
                <img src="https://logoexecutive.vercel.app/static/media/business-man-logo.3a122f718b0294570293.webp"
                  alt="Logo" style="height: 35px; width: 35px; margin-right: 10px; filter: invert();">
                <span style="font-size: 24px; font-weight: 800;">Forgot Password</span>
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 20px; text-align: left;">
              <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Hi there,</p>
              <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Thank you for visiting Logoexecutive.</p>
              <p style="font-size: 16px; color: #333; margin-bottom: 10px;"><strong>It seems like you forgot your
                  password?</strong></p>
              <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Please click on the following link to reset your
                password</p>
              <a href="${url}"
                style="display: inline-block; cursor: pointer; border: none; padding: 12px 20px; font-size: 16px; font-weight: bold; background-color: rgb(79, 70, 229); color: white; border: 2px solid rgb(229, 231, 235); text-decoration: none; border-radius: 6px; transition: 200ms ease-in-out; box-shadow: rgba(140, 152, 164, 0.125) 0px 6px 24px 0px; margin-top: 20px;">Click
                on the link</a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f1f1; padding: 12px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <p style="font-size: 14px; color: #777; margin: 0;">
                      This is an automated message from OpenLogo. Please do not reply to this email.
                      <br>
                      Copyright © 2024 | OpenLogo
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div
                      style="display: inline-block; border: 2px solid rgb(79, 70, 229); border-radius: 6px; padding: 2px 6px;">
                      <a href="https://team.shiksha/" target="_blank" rel="noopener"
                        style="text-decoration: none; color: rgb(79, 70, 229); font-weight: 700; font-size: 16px; display: flex; align-items: center;">
                        Powered By
                        <img src="https://logoexecutive.vercel.app/static/media/teamshishalogo.7bfb117958cfe1b031c9.webp"
                          alt="TeamShiksha Logo" style="margin-left: 5px; width: auto; height: 18px;">
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;
};

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

const mailText = (url) => ({
  subject: "Change Password",
  body: `To change the password, please click on the link\n\n${url}`,
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

    const htmlBody = getHTMLBody(userToken.tokenURL()); 
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
