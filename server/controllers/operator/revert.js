const Joi = require("joi");
const { STATUS_CODES } = require("http");
const fs = require("fs");
const handlebars = require("handlebars");
const { fetchUserFromId, updateForm } = require("../../services");
const { isValidObjectId } = require("mongoose");
const { sendEmail } = require("../../utils/sendEmail");

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
    const htmlFile = fs.readFileSync(
      __dirname + "/../../templates/RevertEmail.html",
      "utf-8"
    ).toString();
    const template = handlebars.compile(htmlFile);
    const replacements = {
      message: revertForm.message,
      reply
    };
    const htmlBody = template(replacements);
    const emailRes = await sendEmail(
      revertForm.email,
      "Response for your query at LogoExecutive",
      htmlBody
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
