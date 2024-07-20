const { Users, Subscriptions, Keys } = require("../models");

/**
 * Checks if provided email exists in the user collections
 * @param {string} email
 * @returns {Promise<boolean>} true if email already exists and else false
 **/
const emailRecordExists = async (email) => {
  try {
    const userRef = await Users.findOne({ email }).exec();
    return !!userRef;
  } catch (err) {
    throw err;
  }
}

/**
 * Fetches all the users
 **/
const fetchUsers = async () =>{ 
  try {
    const users = await Users.find().exec();
    return { data: users };
  } catch (err) {
    throw err;
  }
}

/**
 * Fetches user by email
 * @param {string} email - email of the user
 **/
const fetchUserByEmail = async (email) => {
  try {
    const user = await Users.findOne({ email }).exec();
    return user || null;
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
const createUser = async (user) => {
  try {
    const { email, firstName, lastName, password } = user;
    const newUser = await Users.NewUser({ email, firstName, lastName, password });
    if (!newUser) return null;
    const createdUser = new Users(newUser);
    const result = await createdUser.save();
    return result;
  } catch (err) {
    throw err;
  }
}

/**
 * Fetches user by document id
 * @param {string} userId - User Id of user
 **/
const fetchUserFromId = async (userId) => {
  try {
    const user = await Users.findById(userId).exec();
    return user || null;
  } catch (err) {
    throw err;
  }
}

const updatePasswordbyUser = async (user, hashNewPassword) => {
  try {
    user.password = hashNewPassword;
    user.updatedAt = Date.now();
    await user.save();
    return true;
  } catch (err) {
    throw err;
  }
}

const verifyUser = async (user) => {
  try {
    user.isVerified = true;
    await user.save();
    return true;
  } catch (err) {
    throw err;
  }
}

const updateUser = async (updateProfile, user) => {
  try {
    const { firstName, lastName } = updateProfile;
    user.firstName = firstName;
    user.lastName = lastName;
    user.updatedAt = Date.now();
    await user.save();
    return true;
  } catch (err) {
    throw err;
  }
}

const deleteUserAccount = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await Users.findByIdAndDelete(userId).session(session).exec();
    if (!user) throw new Error("User not found");

    // Deleting associated subscriptions and keys
    await Subscriptions.deleteMany({ user: user._id }).session(session).exec();
    await Keys.deleteMany({ user: user._id }).session(session).exec();

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  }finally{
    session.endSession();
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