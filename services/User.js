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
      .limit(1).get();
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
 * @param {string} user.firstName - First name of the user
 * @param {string} user.lastName - Last name of the user
 * @param {string} user.password - password of the user
 */
async function createUser(user) {
  try {
    const { email, firstName, lastName, password } = user;

    const newUser = await User.NewUser({
      email,
      firstName,
      lastName,
      password,
    });
    if (!newUser)
      return null;

    const result = await UserCollection.doc(newUser.userId).set({ newUser, isVerified: false });

    if (!result)
      return null;

    const createdUser = new User(newUser);
    return createdUser;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

/**
	* Fetches user by document id
	* @param {string} userId - User Id of user
	**/
async function fetchUserFromId(userId) {
  try {
    const userSnapshot = await UserCollection.where("userId", "==", userId).limit(1).get();

    if(userSnapshot.empty)
      return null;

    const userDoc = userSnapshot.docs[0];
    return new User({ ...userDoc.data(), userRef: userDoc.ref });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function updatePasswordService(user, hashNewPassword){
  try {
    await user.userRef.update({
      password: hashNewPassword,
    });
    return true;

  } catch (err){
    console.log(err);
    throw err;
  }
}

module.exports = {
  fetchUsers,
  fetchUserByEmail,
  createUser,
  updatePasswordService,
  fetchUserFromId
};
