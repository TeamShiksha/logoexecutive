const { UserType } = require("../utils/constants");
const { Users } = require("../models");
const mongoose = require("mongoose");

async function setUserAdmin(emailId) {
  try {
    const userRef = await Users.findOne({ email: emailId });
    if (!userRef) return null;

    if (userRef.userType === UserType.ADMIN) {
      return {
        success: true,
        isNewAdmin: false,
      };
    }

    Users.findByIdAndUpdate(
      userRef._id,
      { $set: { userType: UserType.ADMIN } },
    );
    return {
      success: true,
      isNewAdmin: true,
    };
  } catch (err) {
    throw err;
  }
}

module.exports = { setUserAdmin };
