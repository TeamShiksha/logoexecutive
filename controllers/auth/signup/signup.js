const Joi = require("joi");
const { emailRecordExists } = require("../../../services/Auth");
const { createUser, fetchUserByEmail } = require("../../../services/User");
const sendEmail = require("../../../services/sendEmail");

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
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/),
  password: Joi.string().trim().required().min(8).max(30),
  confirmPassword: Joi.any().required().equal(Joi.ref("password")),
});

async function signupController(req, res) {
  const { body: payload } = req;

  const { error, value } = signupPayloadSchema.validate(payload);

  if (!!error) {
    return res.status(422).json([{
      message: error.message,
      error: "unprocessable content",
      statusCode: 422,
    }]);
  }

  const { email } = value;

  const emailExists = await emailRecordExists(email);

  if (emailExists) {
    return res.status(400).json([{
      message: "Email already exists",
      error: "bad request",
      status: 400,
    }]);
  }

  const result = await createUser(value);
  if (!result) {
    return res.status(500).json([{
      message: "Unexpected error while creating user",
      error: "internal server error",
      status: 500,
    }]);
  }

  const user = await fetchUserByEmail(email);
  if (!user) {
    return res.status(404).json([{
      message: "User not found",
      error: "not found",
      status: 404,
    }]);
  }

  const userVerificationUrl = user.getVerificationUrl();

  const emailRes=await sendEmail(user.email, "Please Verify email", userVerificationUrl.href);
  if (!emailRes.success) {
    return res.status(206).json([{
      message: "Failed to send verification email",
      error: emailRes.error,
      status: 500,
    }, {
      message: "Successfully created user",
      data: result.data,
      status: 201,
    }]);
  }

  return res.status(201).json([{
    message: "Successfully created user",
    data: result.data,
    status: 201,
  }, {
    message: "Verification email sent successfully",
    status: 200,
  }]);
}

module.exports = signupController;
