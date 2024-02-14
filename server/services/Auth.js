const { UserCollection } = require("../utils/firestore");

/**
 * Checks if provided email exists in the user collections
 * @param {string} email
 * @returns {Promise<boolean>} true if email already exists and else false
 **/
async function emailRecordExists(email) {
  try {
    const userRef = await UserCollection.where("email", "==", email).get();
    return !userRef.empty;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  emailRecordExists,
};
