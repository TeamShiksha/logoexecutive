const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { fetchUserFromId, updateForm } = require("../../services");
const { isValidObjectId } = require("mongoose");
const { sendEmail } = require("../../utils/sendEmail");

const getHTMLReplyForCustomer = (message, reply) => {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LogoExecutive Email</title>
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
                <span style="font-size: 24px; font-weight: 800;">LogoExecutive</span>
              </a>
           </td>
          </tr>
          <tr>
            <td style="padding: 50px 20px;">
              <h4 style="font-weight: 400; margin: 0;">
                Hi there,
                <br><br>
                Thanks for connecting with us through our contact-us form. We have prepared a response based on your question
                (<b><i>${message}</i></b>) below:
                <br><br>
                <i>${reply}</i>
                <br><br>
                Thanks,<br>
                LogoExecutive Team
              </h4>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f1f1; padding: 12px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <p style="font-size: 14px; color: #777; margin: 0;">
                      Copyright © 2024 | LogoExecutive
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

const revertToCustomerPayloadSchema = Joi.object().keys({
  id: Joi.string()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.invalid": "Key ID must be a valid mongodb objectId",
      "any.required": "Key ID is required"
    }),
  reply: Joi.string()
    .trim()
    .required()
    .min(20)
    .max(500)
    .regex(/^[^!@#$%^&*(){}\[\]\\\.;'",.<>/?`~|0-9]*$/)
    .messages({
      "string.base": "Reply must be string",
      "string.min": "Reply should be at least be 20 characters",
      "string.max": "Reply must be 500 or fewer characters",
      "any.required": "Reply is required",
      "string.pattern.base": "Reply should only contain alphabets"
    })
});

async function revertToCustomerController(req, res, next) {
  try {
    const { userId } = req.userData;
    const user = await fetchUserFromId(userId);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: "User not found"
      });
    }

    const { error, value } = revertToCustomerPayloadSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        error: STATUS_CODES[422],
        message: error.message,
        statusCode: 422
      });
    }

    const { id, reply } = value;
    const revertForm = await updateForm(id, reply, userId);
    if (revertForm?.alreadyReplied) {
      return res.status(409).json({
        statusCode: 409,
        error: STATUS_CODES[409],
        message: "Already sent the response for this query!"
      });
    }
    const htmlReply = getHTMLReplyForCustomer(revertForm.message, reply);
    const emailRes = await sendEmail(
      revertForm.email,
      "Response for your query at LogoExecutive",
      htmlReply
    );
    if (!emailRes.success) {
      return res.status(500).json({
        statusCode: 500,
        error: STATUS_CODES[500],
        message: "Failed to send email to customer"
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Response sent to customer successfully"
    });
  } catch (error) {
    next(error);
  }
}

module.exports = revertToCustomerController;
