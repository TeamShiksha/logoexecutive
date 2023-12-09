const Joi = require("joi");
const { fetchUserByEmail } = require("../../../services/User");
const { fetchSubscriptionByuserid } = require("../../../services/Subscription");
const { fetchKeyByuserid } = require("../../../services/Key");
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
    if (!!error)
      return res.bang.unprocessableEntity(error.message);

    const { email, password } = value;
    const user = await fetchUserByEmail(email);
    if (!user)
      return res.bang.badRequest("Email or Password incorrect");

    if(user.isUserVerified())
      return res.bang.unauthorized("Email is not verified");

    const matchPassword = await user.matchPassword(password);
    if (!matchPassword)
      return res.bang.badRequest("Email or Password incorrect");

    const subscription = await fetchSubscriptionByuserid(user.userId);
    const keys = await fetchKeyByuserid(user.userId);

    res.cookie("jwt", user.generateJWT());
    return res.status(200).json({
      data: {
        email: user.data.email,
        firstName: user.data.firstName,
        lastName: user.data.lastName,
        subcription: {
          subscriptionType: subscription.subscriptionType,
          usageLimit: subscription.usageLimit,
          isActive: subscription.isActive,
          keyLimit: subscription.keyLimit
        },
        keys: {
          ...keys
        }
      },
      message: "Succesfully signed in",
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = signinController;
