const Joi = require("joi");
const sendEmail = require("../../services/sendEmail");
const {
  updateUserName,
  updateUserEmail,
  generateEmailUpdateToken,
  deleteUserToken,
} = require("../../services/updateUser");
const { fetchUserByEmail, fetchUserByToken } = require("../../services/User");
const e = require("express");

const changeNameEmailSchema = Joi.object().keys({
  firstName: Joi.string()
    .trim()
    .required()
    .min(1)
    .max(20)
    .regex(/^[^!@#$%^&*(){}\[\]\\\.;'",.<>/?`~|0-9]*$/)
    .message("firstName should not contain any special character or number"),
  lastName: Joi.string().trim().optional().min(1).max(20),
  email: Joi.string()
    .trim()
    .required()
    .max(50)
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/),
});

async function updateProfileController(req, res) {
  try {
    const { currEmail } = req.query;
    const { name, email } = req.body;

    if (!currEmail) {
      return res
        .status(400)
        .json({ message: "Bad Request: currEmail is required" });
    }

    if (!name || !email) {
      return res
        .status(400)
        .json({
          message: "Bad Request: name and email are required in the payload",
        });
    }

    const nameArr = name.split(" ");
    const firstName = nameArr[0];
    const lastName = nameArr.slice(1).join(" ");

    const { error } = changeNameEmailSchema.validate({
      firstName,
      lastName,
      email,
    });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await fetchUserByEmail(currEmail);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user.email === email &&
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
    changes.push(currEmail);

    await updateUserName(changes);
    successRes.push("Username updated successfully");

    if (user.email !== email) {
      const token = await generateEmailUpdateToken(currEmail);

      const emailUpdateVerificationURL = new URL(
        "/updateProfile/verifyAndUpdateEmail",
        process.env.BASE_URL
      );
      emailUpdateVerificationURL.searchParams.append("token", token);
      emailUpdateVerificationURL.searchParams.append("newEmail", email);

      await sendEmail(
        email,
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
    const { token, newEmail } = req.query;
    if (!token) {
      return res.status(400).json({
        error: "Bad Request",
        message: "No token provided",
      });
    }

    await updateUserEmail(token, newEmail);

    return res.status(200).json({
      message: "Email changed successfully",
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
