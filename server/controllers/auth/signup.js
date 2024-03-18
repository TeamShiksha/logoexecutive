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
    .message("firstName should not contain any special character or number"),
  lastName: Joi.string()
    .trim()
    .required()
    .min(1)
    .max(20)
    .regex(/^[^!@#$%^&*(){}\[\]\\\.;'",.<>/?`~|0-9]*$/)
    .message("lastName should not contain any special character or number"),
  email: Joi.string()
    .trim()
    .required()
    .max(50)
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .message("email should be valid"),
  password: Joi.string().trim().required().min(8).max(30),
  confirmPassword: Joi.any().required().equal(Joi.ref("password")).messages({"any.only": "Confirm Password should match password"}),
});

async function signupController(req, res, next) {
  try {
    const { error, value } = signupPayloadSchema.validate(req.body);
    if (!!error) {
      return res.status(422).json(
        {
          message: error.message,
          error: STATUS_CODES[422],
          statusCode: 422,
        },
      );
    }

    const { email } = value;
    const emailExists = await emailRecordExists(email);
    if (emailExists) {
      return res.status(400).json(
        {
          message: "Email already exists",
          error: STATUS_CODES[400],
          statusCode: 400,
        },
      );
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
      "Please Verify email",
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
        message: "user created successfully and verification email sent on your email.",
        statusCode: 201,
      },
    );
  } catch (err) {
    next(err);
  }
}

module.exports = signupController;
