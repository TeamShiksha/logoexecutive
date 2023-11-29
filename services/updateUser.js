const { UserCollection } = require("../utils/firestore");
const { Timestamp } = require("firebase-admin/firestore");
const {fetchUserByToken,deleteUserToken} = require("./User");



/**
   * Generates a UUID token, stores it in the DB, and returns it
   * @param {string} currEmail - email address of the user
   */
async function generateEmailUpdateToken(currEmail) {
  try {
    const userRef = await UserCollection.where("email", "==", currEmail)
      .limit(1)
      .get();
  
    if (userRef.empty) {
      return null;
    }
  
    const token =crypto.randomUUID().replace(/-/g, "");
  
    await userRef.docs[0].ref.update({
      token,
      updatedAt: Timestamp.now(),
    });
  
    return token;
  } catch (err) {
    console.log(err);
    throw err;
  }
}


/**
 * Updates user's first name and last name in the DB
 * @param {string} email - email address of the user
 * @param {string} firstName - new first name of the user
 * @param {string} lastName - new last name of the user
 */
async function updateUserName(inputArray) {
  try {
    const [firstName, lastName, currEmail] = inputArray;

    const userRef = await UserCollection.where("email", "==", currEmail)
      .limit(1)
      .get();

    if (userRef.empty) {
      return null;
    }

    const update = {
      updatedAt: Timestamp.now(),
    };

    if (firstName !== null) {
      update.firstName = firstName;
    }

    if (lastName !== null) {
      update.lastName = lastName;
    }

    await userRef.docs[0].ref.update(update);

    return { success: true };
  } catch (err) {
    console.log(err);
    throw err;
  }
}
  
/**
   * Updates user's email in the DB
   * @param {string} token - token of the user
   * @param {string} email - new email of the user
   */
async function updateUserEmail(token, email) {
  try {
    const user = await fetchUserByToken(token);

    if (!user) {
      return null;
    }
  
    if (email !== null && email !== undefined) {
      await UserCollection.doc(user.id).update({
        email,
        updatedAt: Timestamp.now(),
      });
    }

    await deleteUserToken(token);
    return { success: true };
  } catch (err) {
    console.log(err);
    throw err;
  }
}


  
module.exports = {
  updateUserName,
  updateUserEmail,
  generateEmailUpdateToken,
};