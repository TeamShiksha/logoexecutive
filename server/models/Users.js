const bcrypt = require("bcrypt");
const { DocumentReference, Timestamp } = require("firebase-admin/firestore");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
const { UserType } = require("../utils/constants");
const { normalizeDate } = require("../utils/date");

class Users {
  userId;
  email;
  firstName;
  lastName;
  createdAt;
  updatedAt;
  userRef;
  isVerified;
  userType;
  #password;

  /**
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.email
   * @param {string} params.password
   * @param {boolean} params.isVerified
   * @param {string} params.firstName
   * @param {string} params.lastName
   * @param {string} params.userType
   * @param {Date} params.createdAt
   * @param {Date} params.updatedAt
   * @param {DocumentReference} [params.userRef] - Firebase document reference of the user
   * @param {string} [params.token]
   **/
  constructor(params) {
    this.userId = params.userId;
    this.email = params.email;
    this.#password = params.password;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.userType = params.userType;
    this.createdAt = normalizeDate(params.createdAt);
    this.updatedAt = normalizeDate(params.updatedAt);
    this.userRef = params.userRef ?? null;
    this.isVerified = params.isVerified;
  }

  get data() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      userId: this.userId,
      userType: this.userType,
    };
  }

  /**
   * Creates a firestore compatible object with current time for createdAt
   * and updatedAt using Firebase Timestamp
   *
   * @param {Object} userData
   * @param {string} userData.email
   * @param {string} userData.firstName
   * @param {string} userData.lastName
   * @param {string} userData.password
   * @param {string} userData.userType
   **/
  static async NewUser(userData) {
    try {
      const { email, firstName, lastName, password } = userData;
      if (!email || !firstName || !lastName || !password) {
        return null;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      return {
        userId: v4(),
        email,
        firstName,
        lastName,
        userType: UserType.CUSTOMER,
        password: hashedPassword,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isVerified: false,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Returns true or false if the password provided matches the user's password
   * @param {string} password - password to match
   **/
  async matchPassword(password) {
    const match = await bcrypt.compare(password, this.#password);
    return !!match;
  }

  /**
   * Signs and returns jwt token with user data
   **/
  generateJWT() {
    return jwt.sign({ data: this.data }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  }
}

module.exports = Users;
