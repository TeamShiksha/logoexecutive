const User = require("../models/Users");
const { UserCollection } = require("../utils/firestore");
const { Timestamp } = require("firebase-admin/firestore");
const bcrypt = require("bcrypt");

/**
 * Fetches all the users
 **/
async function fetchUsers() {
  try {
    const usersRef = await UserCollection.get();

    const users = usersRef.docs.map(
      (doc) => new User({ ...doc.data(), id: doc.id })
    );

    return {
      data: users,
    };
  } catch (err) {
    console.log(err);
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
    if (userRef.empty) {
      return null;
    }

    const user = new User({
      ...userRef.docs[0].data(),
      userRef: userRef.docs[0].ref,
    });
    return user;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

/**
 * Creates user in the DB
 * @param {Object} user - User Object
 * @param {string} user.email - email address of the user
 * @param {string} user.name - name of the user
 * @param {string} user.password - password of the user
 */
async function createUser(user) {
  try {
    const userData = {
      userId: crypto.randomUUID(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: await bcrypt.hash(user.password, 10),
      token: crypto.randomUUID().replace(/-/g, ""),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const result = await UserCollection.add(userData);
    const createdUser = new User(userData);
    return createdUser;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

/**
 * fetchUserByToken - Fetches user from provided token
 * @param {string} token - token of the user
 **/
async function fetchUserByToken(token) {
  try {
    const userSnapshot = await UserCollection.where("token", "==", token)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return null;
    }

    const user = new User({
      ...userSnapshot.docs[0].data(),
      id: userSnapshot.docs[0].id,
    });

    return user;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

/**
 * deleteUserToken - Fetches user from provided token
 * @param {string} token - token of the user
 **/
async function deleteUserToken(token) {
  try {
    const userSnapshot = await UserCollection.where("token", "==", token)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return null;
    }

    await userSnapshot.docs[0].ref.update({
      token: null,
    });

    return { success: true };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function updatePasswordService(user, hashNewPassword) {
  try {
    await user.userRef.update({
      password: hashNewPassword,
    });
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

/**
 * Generates a UUID token, stores it in the DB, and returns it
 * @param {string} currEmail - email address of the user
 */
async function generateEmailUpdateToken(user) {
  try {
    const userRef = user.userRef;

    const token = crypto.randomUUID().replace(/-/g, "");

    await userRef.update({
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
async function updateUser(inputArray, user) {
  try {
    const [firstName, lastName, email] = inputArray;
    const userRef = user.userRef;
    const update = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      updatedAt: Timestamp.now(),
    };
    await userRef.update(update);

    return { success: true };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  fetchUsers,
  fetchUserByEmail,
  createUser,
  fetchUserByToken,
  deleteUserToken,
  updatePasswordService,
  generateEmailUpdateToken,
  updateUser,
};
