const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { formExists, createForm } = require("../../services");

const contactUsPayloadSchema = Joi.object().keys({
  name: Joi.string()
    .trim()
    .required()
    .min(1)
    .max(40)
    .regex(/^[^!@#$%^&*(){}\[\]\\\.;'",.<>/?`~|0-9]*$/)
    .messages({
      "string.base": "Name must be string",
      "string.min": "Name cannot be empty",
      "string.max": "Name must be 40 or fewer characters",
      "any.required": "Name is required",
      "string.pattern.base": "Name should only contain alphabets",
    }),
  email: Joi.string()
    .trim()
    .required()
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .messages({
      "string.base": "Email must be a string",
      "any.required": "Email is required",
      "string.pattern.base": "Invalid email",
    }),
  message: Joi.string()
    .trim()
    .required()
    .min(20)
    .max(500)
    .regex(/^[^!@#$%^&*(){}\[\]\\\.;'",.<>/?`~|0-9]*$/)
    .messages({
      "string.base": "Message must be string",
      "string.min": "Message should be at least be 20 characters",
      "string.max": "Message must be 500 or fewer characters",
      "any.required": "Message is required",
      "string.pattern.base": "Message should only contain alphabets",
    }),
});

async function contactUsController(req, res, next) {
  try {
    const { error, value } = contactUsPayloadSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });
    }
    const { email } = value;

    const form = await formExists(email);
    if (!!form) {
      return res.status(400).json({
        message: "Form already submitted, try again later",
        statusCode: 400,
        error: STATUS_CODES[400],
      });
    }
    const newForm = await createForm(value);
    if (!newForm) {
      return res.status(500).json({
        message: "Something went wrong, try again later",
        statusCode: 500,
        error: STATUS_CODES[500],
      });
    }

    return res.status(200).json({
      message: "Form submitted, our team will get in touch shortly",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = contactUsController;
