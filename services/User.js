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

    const users = usersRef.docs.map((doc) => new User({ ...doc.data(), id: doc.id }));

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

    const user = new User({ ...userRef.docs[0].data(), id: userRef.docs[0].id });

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
    const { email, firstName, lastName = "", password } = user;

    const result = await UserCollection.add({
      email,
      firstName,
      lastName,
      password: await bcrypt.hash(password, 10),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      token: crypto.randomUUID().replace(/-/g, ""),
    });

    const userRef = await result.get();
    const createdUser = new User(userRef.data());

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

    const user = new User({...userSnapshot.docs[0].data(), id: userSnapshot.docs[0].id});
    
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

    return {success: true};
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
};