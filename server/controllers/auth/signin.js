const Joi = require("joi");
const dayjs = require("dayjs");
const { STATUS_CODES } = require("http");
const { fetchUserByEmail } = require("../../services");

const signinPayloadSchema = Joi.object().keys({
  email: Joi.string()
    .trim()
    .required()
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .messages({
      "string.base": "Email must be a string",
      "any.required": "Email is required",
      "string.pattern.base": "Invalid email",
    }),
  password: Joi.string().trim().required().messages({
    "string.base": "Password must be string",
    "any.required": "Password is required",
  }),
});

async function signinController(req, res, next) {
  try {
    const { body: payload } = req;
    const { error, value } = signinPayloadSchema.validate(payload);
    if (!!error)
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });

    const { email, password } = value;
    const user = await fetchUserByEmail(email);
    if (!user)
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: "Incorrect email or password",
        statusCode: 404,
      });

    if (!user.isVerified)
      return res.status(403).json({
        error: STATUS_CODES[403],
        message: "Email not verified",
        statusCode: 403,
      });

    const matchPassword = await user.matchPassword(password);
    if (!matchPassword) {
      return res.status(401).json({
        error: STATUS_CODES[401],
        message: "Incorrect email or password",
        statusCode: 401,
      });
    }

    res.cookie("jwt", user.generateJWT(), {
      expires: dayjs().add(1, "day").toDate(),
      sameSite: "none",
      secure: true,
    });
    return res.status(200).json({ message: "Sign In Successful" });
  } catch (err) {
    next(err);
  }
}

module.exports = signinController;
