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
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Lato:wght@700&family=Nunito&family=Poppins&display=swap" rel="stylesheet" />
      <style>
        *,
        *::before,
        *::after {
          box-sizing: border-box;
          list-style: none;
        }

        * {
          padding: 0;
          margin: 0;
          font-family: Inter;
        }
      </style>
    </head>

    <body style="--white: rgb(255, 255, 255); --smooth-purple: rgb(79, 70, 229); --black: rgb(17, 24, 39); --smooth-gray: rgb(107 114 128); --description: rgb(75, 85, 99); --light-purple: rgba(79, 70, 229, 0.1); --faded-purple: rgba(79, 70, 229, 0.5); --border: 2px solid rgb(229, 231, 235); --bradius: 6px; --shadow: rgba(140, 152, 164, 0.125) 0px 6px 24px 0px; --small-text: 12px; --medium-text: 16px; --large-text: 20px; --gray-drag-drop-background: rgb(249, 250, 251); --error: rgb(255, 55, 55); --success: rgb(52, 168, 83); --table-heading-bg: rgb(226, 224, 224);">
      <header style="padding: 20px; background-color: #f1f1f1;">
        <a class="logo" href="https://logoexecutive.vercel.app/home" style="color: var(--black); cursor: pointer; text-decoration: none; display: flex; align-items: center; justify-content: center;">
          <img src="https://logoexecutive.vercel.app/static/media/business-man-logo.3a122f718b0294570293.webp" style="height: 35px; width: 35px; margin-right: 10px;" />
          <h2 style="font-size: 24px; font-weight: 800;">LogoExecutive</h2>
        </a>
      </header>
      <main style="padding: 30px;">
        <h4 style="font-weight: 400;">
          Hi there,
          <br />
          <br />
          Thanks for connecting with us through our contact-us form. We have prepared a response based on your query:
          
          <br />
          <br />
          <b>Query:</b>
          <br />
          ${message}
          <br />

          <br />
          <b>Reply:</b>
          <br />
          ${reply}
          <br />
          
          <br />
          <br />
          Thanks,
          <br />
          OpenLogo Team
        </h4>
      </main>
      <footer class="footer" style="width: 100%; background-color: #f1f1f1; display: flex; padding: 12px 0; position: fixed; left: 0; bottom: 0; width: 100%;">
        <section class="footer-child" style="padding: 12px; display: flex; justify-content: center; flex-direction: column; align-items: center; gap: 20px; flex-grow: 1; max-width: 500px; text-align: center; margin: 0 auto;">
          <div class="footer-child-heading-container" style="display: flex; gap: 16px;">
            <h4 style="font-size: var(--large-text); color: var(--black);">Copyright © 2024 | OpenLogo</h4>
          </div>
          <section class="poweredBy" style="display: flex; align-items: center; justify-content: center; border: 2px solid var(--smooth-purple); border-radius: 6px; padding: 2px 6px; cursor: pointer; color: var(--smooth-purple); font-weight: 700; font-size: var(--medium-text);">Powered By<img src="https://logoexecutive.vercel.app/static/media/teamshishalogo.7bfb117958cfe1b031c9.webp" alt="TeamShiksha Logo" style="margin-left: 5px; width: auto; height: 18px;"></section>
        </section>
      </footer>
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
