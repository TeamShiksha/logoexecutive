const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { sendEmail } = require("../../utils/sendEmail");
const { createUser, emailRecordExists,
  createVerifyToken, createSubscription } = require("../../services");

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
            <td style="padding: 20px; background-color: #f1f1f1; margin: 0 auto; text-align: center">
              <a href="https://logoexecutive.vercel.app/home"
                style="color: rgb(17, 24, 39); text-decoration: none;">
                <img src="https://logoexecutive.vercel.app/static/media/business-man-logo.3a122f718b0294570293.webp"
                  alt="Logo" style="height: 35px; width: 35px; margin-right: 10px; vertical-align: bottom;">
                <span style="font-size: 24px; font-weight: 800;">Forgot Password</span>
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 20px; text-align: left;">
              <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Hi there,</p>
              <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Thank you for visiting LogoExecutive.</p>
              <p style="font-size: 16px; color: #333; margin-bottom: 10px;"><strong>Please verify your email, by visiting the below link.</strong></p>
              <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Please click on the following link to reset your
                password</p>
              <a href="${url}"
                style="display: inline-block; cursor: pointer; border: none; padding: 12px 20px; font-size: 16px; font-weight: bold; background-color: rgb(79, 70, 229); color: white; border: 2px solid rgb(229, 231, 235); text-decoration: none; border-radius: 6px; transition: 200ms ease-in-out; box-shadow: rgba(140, 152, 164, 0.125) 0px 6px 24px 0px; margin-top: 20px;">Click
                on the link to verify</a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f1f1; padding: 12px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <p style="font-size: 14px; color: #777; margin: 0;">
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
                <tr>
                  <td style="padding-top: 10px;">
                    <p style="font-size: 10px; color: #777; margin: 0;">
                      This is an automated message from LogoExecutive. Please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;
};

const signupPayloadSchema = Joi.object().keys({
  firstName: Joi.string()
    .trim()
    .required()
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
    .required()
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
  email: Joi.string()
    .trim()
    .required()
    .max(50)
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .messages({
      "string.base": "Email must be a string",
      "string.max": "Email lenght must be 50 or fewer",
      "any.required": "Email is required",
      "string.pattern.base": "Invalid email",
    }),
  password: Joi.string().trim().required().min(8).max(30).messages({
    "string.base": "Password must be string",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must be 30 characters or fewer",
    "any.required": "Password is required"
  }),
  confirmPassword: Joi.any().required().equal(Joi.ref("password")).messages({
    "any.only": "Password and confirm password do not match"
  }),
});

async function signupController(req, res, next) {
  try {
    const { error, value } = signupPayloadSchema.validate(req.body);
    if (!!error) {
      return res.status(422).json({
        message: error.message,
        error: STATUS_CODES[422],
        statusCode: 422,
      });
    }

    const { email } = value;
    const emailExists = await emailRecordExists(email);
    if (emailExists) {
      return res.status(400).json({
        message: "Email already exists",
        error: STATUS_CODES[400],
        statusCode: 400
      });
    }

    const newUser = await createUser(value);
    if (!newUser) {
      return res.status(500).json(
        {
          message: "Unexpected error occurred while creating user",
          error: STATUS_CODES[500],
          statusCode: 500,
        },
      );
    }

    const newsubcription = await createSubscription(newUser._id);
    if (!newsubcription) {
      return res.status(206).json(
        {
          message:
            "Successfully created user but Unexpected error occurred while creating subscription",
          statusCode: 201,
        },
      );
    }

    const verificationToken = await createVerifyToken(newUser._id);
    if (!verificationToken)
      return res.status(206).json(
        {
          message:
            "user created successfully. Verification email failed to send. Please visit our contact page for assistance. We're here to help.",
          statusCode: 201,
        },
      );

    const htmlBody = getHTMLBody(verificationToken.tokenURL()); 
    const emailRes = await sendEmail(
      newUser.email,
      "Please Verify your email",
      htmlBody
    );
    if (!emailRes.success) {
      return res.status(206).json(
        {
          message:
            "User created successfully. Verification email failed to send. Please visit our contact page for assistance. We're here to help.",
          statusCode: 201,
        },
      );
    }

    return res.status(201).json(
      {
        message: "User created successfully. Verification email sent",
        statusCode: 201,
      },
    );
  } catch (err) {
    next(err);
  }
}

module.exports = signupController;
