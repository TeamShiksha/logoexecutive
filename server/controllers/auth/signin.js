const Joi = require("joi");
const dayjs = require("dayjs");
const { STATUS_CODES } = require("http");
const { fetchUserByEmail } = require("../../services");

const signinPayloadSchema = Joi.object().keys({
  email: Joi.string()
    .trim()
    .required()
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .message("The Email you have entered is invalid"),
  password: Joi.string().trim().required().min(8).max(30),
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
      return res.status(401).json({
        error: STATUS_CODES[401],
        message: "The Email or Password you entered is incorrect",
        statusCode: 401,
      });

    if(!user.isVerified)
      return res.status(401).json({
        error: STATUS_CODES[401],
        message: "The Email you have entered is not verified",
        statusCode: 401
      });

    const matchPassword = await user.matchPassword(password);
    if (!matchPassword) {
      return res.status(401).json({
        error: STATUS_CODES[401],
        message: "The Email or Password you entered is incorrect",
        statusCode: 401,
      });
    }

    res.cookie("jwt", user.generateJWT(), { expires: dayjs().add(1, "day").toDate() });
    return res.status(200).json({ message: "You have succesfully signed in" });
  } catch (err) {
    next(err);
  }
}

module.exports = signinController;
