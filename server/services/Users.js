const { Timestamp } = require("firebase-admin/firestore");
const { Users } = require("../models");
const { UserCollection } = require("../utils/firestore");
const { KeyCollection } = require("../utils/firestore");
const { SubscriptionCollection } = require("../utils/firestore");
const { db } = require("../utils/firestore");

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
    throw err;
  }
}

/**
 * Fetches all the users
 **/
async function fetchUsers() {
  try {
    const usersRef = await UserCollection.get();
    const users = usersRef.docs.map(
      (doc) => new Users({ ...doc.data(), id: doc.id })
    );
    return {
      data: users,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * fetchUserByUsername - Fetches user from provided key
 * @param {string} email - email of the user
 **/
async function fetchUserByEmail(email) {
  try {
    const userRef = await UserCollection.where("email", "==", email)
      .limit(1)
      .get();
    if (userRef.empty) return null;
    const user = new Users({
      ...userRef.docs[0].data(),
      userRef: userRef.docs[0].ref,
    });
    return user;
  } catch (err) {
    throw err;
  }
}

/**
 * Creates user in the DB
 * @param {Object} user - User Object
 * @param {string} user.email - email address of the user
 * @param {string} user.firstName - First name of the user
 * @param {string} user.lastName - Last name of the user
 * @param {string} user.password - password of the user
 */
async function createUser(user) {
  try {
    const { email, firstName, lastName, password } = user;
    const newUser = await Users.NewUser({
      email,
      firstName,
      lastName,
      password,
    });
    if (!newUser) return null;
    const result = await UserCollection.doc(newUser.userId).set({
      ...newUser,
      isVerified: false,
    });
    if (!result) return null;
    const createdUser = new Users(newUser);
    return createdUser;
  } catch (err) {
    throw err;
  }
}

/**
 * Fetches user by document id
 * @param {string} userId - User Id of user
 **/
async function fetchUserFromId(userId) {
  try {
    const userSnapshot = await UserCollection.where("userId", "==", userId)
      .limit(1)
      .get();
    if (userSnapshot.empty) return null;

    return new Users({
      ...userSnapshot.docs[0].data(),
      userRef: userSnapshot.docs[0].ref,
    });
  } catch (err) {
    throw err;
  }
}

async function updatePasswordbyUser(user, hashNewPassword) {
  try {
    await user.userRef.update({
      password: hashNewPassword,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (err) {
    throw err;
  }
}

async function verifyUser(user) {
  try {
    const result = await user.userRef.update({ isVerified: true });
    if (!result) return false;
    return true;
  } catch (err) {
    throw err;
  }
}

async function updateUser(updateProfile, user) {
  try {
    const { firstName, lastName } = updateProfile;
    const userRef = user.userRef;
    const update = {
      firstName: firstName,
      lastName: lastName,
      updatedAt: Timestamp.now(),
    };
    const updated = await userRef.update(update);
    if (!updated) return false;
    return true;
  } catch (err) {
    throw err;
  }
}

async function deleteUserAccount(userId) {
  try {
    await db.runTransaction(async (transaction) => {
      const userSnapshot = await UserCollection.where("userId", "==", userId)
        .limit(1)
        .get();
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        transaction.delete(userDoc.ref);
      }

      const subscriptionSnapshot = await SubscriptionCollection.where(
        "userId",
        "==",
        userId
      ).get();
      subscriptionSnapshot.forEach((doc) => transaction.delete(doc.ref));

      const keySnapshot = await KeyCollection.where(
        "userId",
        "==",
        userId
      ).get();
      if (!keySnapshot.empty) {
        keySnapshot.forEach((doc) => transaction.delete(doc.ref));
      }
    });
  } catch (err) {
    throw err;
  }
}

module.exports = {
  fetchUsers,
  fetchUserByEmail,
  createUser,
  updatePasswordbyUser,
  fetchUserFromId,
  verifyUser,
  updateUser,
  deleteUserAccount,
  emailRecordExists,
};
