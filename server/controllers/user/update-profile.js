const Joi = require("joi");
const { STATUS_CODES } = require("http");
const {
  fetchUserByEmail,
  updateUser,
  createVerifyToken,
} = require("../../services");
const { sendEmail } = require("../../utils/sendEmail");

const changeNameEmailSchema = Joi.object().keys({
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
    .message("email must be a valid email address"),
});

async function updateProfileController(req, res) {
  try {
    const { firstName, lastName, email } = req.body;
    const { error } = changeNameEmailSchema.validate({
      firstName,
      lastName,
      email,
    });

    if (error) {
      return res.status(422).json({
        status: 422,
        message: error.details[0].message,
        error: STATUS_CODES[422],
      });
    }

    const user = await fetchUserByEmail(req.userData.email);

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: STATUS_CODES[404],
        message: "User not found.",
      });
    }

    if (
      user.email === req.body.email &&
      user.firstName === req.body.firstName &&
      user.lastName === req.body.lastName
    ) {
      return res.status(200).json({
        status: 200,
        message: "The profile has been successfully updated.",
      });
    }

    const changes = ["firstName", "lastName", "email"].map((field) =>
      user[field] !== req.body[field] ? req.body[field] : user[field]
    );

    await updateUser(changes, user);

    let successRes = "The profile has been successfully updated.";

    if (user.email !== req.body.email) {
      const verificationToken = await createVerifyToken(user.userId);
      if (!verificationToken)
        return res.status(500).json([
          {
            message: "Failed to create email verification token",
            error: STATUS_CODES[500],
            statusCode: 500,
          },
        ]);
      await user.userRef.update({
        isVerified: false,
      });

      await sendEmail(
        req.body.email,
        "Change email and name",
        verificationToken.tokenURL.href
      );

      successRes =
        "The verification link for the new email has been successfully sent";

      await sendEmail(
        user.email,
        "Verfication Link Sent to new email",
        " Please verify your new email address by clicking on the link sent to your new email address"
      );

      return res.status(200).json({ status: 200, message: successRes });
    }
    return res.status(200).json({ status: 200, message: successRes });
  } catch (error) {
    next(error);
  }
}

module.exports = updateProfileController;
