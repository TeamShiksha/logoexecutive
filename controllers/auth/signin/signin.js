const Joi = require("joi");
const { fetchUserByEmail } = require("../../../services/User");
const jwt = require("jsonwebtoken");

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
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: "unprocessable content",
      });
    }

    const { email, password } = value;

    const user = await fetchUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        error: "bad request",
        message: "Email or Password incorrect",
        status: 400,
      });
    }

    if(user.token) {
      return res.status(401).json({
        error: "unauthorized access",
        message: "Email is not verified",
        status: 401
      });
    }

    const matchPassword = await user.matchPassword(password);
    if (!matchPassword) {
      return res.status(400).json({
        error: "bad request",
        message: "Email or Password incorrect",
        status: 400,
      });
    }

    res.cookie(
      "jwt",
      jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      }),
    );

    return res.status(200).json({
      data: {
        email: user.data.email,
        firstName: user.data.firstName,
        lastName: user.data.lastName,
      },
      message: "Succesfully signed in",
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = signinController;
