const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { sendEmail } = require("../../utils/sendEmail");
const { createUser, emailRecordExists,
  createVerifyToken, createSubscription } = require("../../services");

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

    const newsubcription = await createSubscription(newUser.userId);
    if (!newsubcription) {
      return res.status(206).json(
        {
          message:
            "Successfully created user but Unexpected error occurred while creating subscription",
          statusCode: 201,
        },
      );
    }

    const verificationToken = await createVerifyToken(newUser.userId);
    if (!verificationToken)
      return res.status(206).json(
        {
          message:
            "user created successfully. Verification email failed to send. Please visit our contact page for assistance. We're here to help.",
          statusCode: 201,
        },
      );

    const emailRes = await sendEmail(
      newUser.email,
      "Please Verify your email",
      verificationToken.tokenURL.href
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
