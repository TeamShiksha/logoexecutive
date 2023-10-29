const Joi = require("joi");
const { fetchUserByEmail } = require("../../../services/User");

const signinPayloadSchema = Joi.object().keys({
  email: Joi.string()
    .trim()
    .required()
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .message("Email is not valid"),
  password: Joi.string().trim().required().min(8).max(30),
});

async function signinController(req, res) {
  try {
    const { body: payload } = req;

    const { error, value } = signinPayloadSchema.validate(payload);
    if (!!error) {
      return res
        .status(422)
        .json({
          message: error.message,
          statusCode: 422,
          error: "unprocessable content"
        });
    }

    const { email, password } = value;

    const user = await fetchUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Email or Password incorrect",
        status: 400,
      });
    }

    const matchPassword = await user.matchPassword(password);
    if (!matchPassword) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Email or Password incorrect",
        status: 400,
      });
    }

    return res.status(200).json({
      user: user.data,
      token: user.generateJWT(),
      expires_in: 24 * 60 * 60,
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = signinController;
