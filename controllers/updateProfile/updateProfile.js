const Joi = require("joi");
const sendEmail = require("../../services/sendEmail");
const {
  fetchUserByEmail,
  deleteUserToken,
  updateUser,
  generateEmailUpdateToken,
} = require("../../services/User");

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
  newEmail: Joi.string()
    .trim()
    .required()
    .max(50)
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .message("email must be a valid email address"),
});

async function updateProfileController(req, res) {
  try {
    const { firstName, lastName, newEmail } = req.body;
    const { email } = req.userData;
    const { error } = changeNameEmailSchema.validate({
      firstName,
      lastName,
      newEmail,
    });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await fetchUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user.email === newEmail &&
      user.firstName === firstName &&
      user.lastName === lastName
    ) {
      return res.status(200).json({ message: "Profile updated successfully" });
    }

    const changes = [];
    const successRes = [];

    if (user.firstName !== firstName) {
      changes.push(firstName);
    } else {
      changes.push(null);
    }
    if (user.lastName !== lastName) {
      changes.push(lastName);
    } else {
      changes.push(null);
    }
    if (user.email !== newEmail) {
      changes.push(newEmail);
    } else {
      changes.push(null);
    }

    await updateUser(changes, user);
    successRes.push("Profile updated successfully");

    if (user.email !== newEmail) {
      const token = await generateEmailUpdateToken(user);

      const emailUpdateVerificationURL = new URL(
        "/update-profile/verifyAndUpdateEmail",
        process.env.BASE_URL
      );
      emailUpdateVerificationURL.searchParams.append("token", token);

      await sendEmail(
        newEmail,
        "Change email and name",
        emailUpdateVerificationURL.href
      );

      successRes.push("Verification link on new email sent successfully");

      return res.status(200).json({ message: successRes });
    }
    return res.status(200).json({ message: successRes });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function verifyAndUpdateEmailController(req, res) {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        error: "Bad Request",
        message: "No token provided",
      });
    }

    await deleteUserToken(token);

    return res.status(200).json({
      message: "New Email verified successfully",
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = {
  updateProfileController,
  verifyAndUpdateEmailController,
};
