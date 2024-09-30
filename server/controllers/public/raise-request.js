const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { createRaiseRequest } = require("../../services");

const postRaiseRequestPayloadSchema = Joi.object({
  email: Joi.string()
    .trim()
    .required()
    .regex(/^[^s@]+@[^s@]+.[^s@]+$/)
    .messages({
      "any.required": "Email is required",
      "string.pattern.base": "Invalid email",
    }),
  companyUrl: Joi.string()
    .trim()
    .required()
    .regex(
      /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))(:\d+)?(\/.*)?$/
    )
    .message({
      "any.required": "URL is required",
      "string.pattern.base": "Invalid URL",
    }),
});

async function raiseRequestController(req, res, next) {
  try {
    const { error, value } = postRaiseRequestPayloadSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }

    const raiseRequest = await createRaiseRequest(value);
    if (!raiseRequest) {
      return res.status(500).json({
        message: "Something went wrong, try again later",
        statusCode: 500,
        error: STATUS_CODES[500],
      });
    }

    return res.status(200).json({
      message:
        "Your raise request has been submitted successfully. We will get back to you shortly.",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = raiseRequestController;
