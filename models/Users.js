const bcrypt = require("bcrypt");
const { DocumentReference } = require("firebase-admin/firestore");
const jwt = require("jsonwebtoken");

class User {
  userId;
  email;
  firstName;
  lastName;
  createdAt;
  updatedAt;
  userRef;
  #token;
  #password;

  /**
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.email
   * @param {string} params.password
   * @param {string} params.firstName
   * @param {string} params.lastName
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
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.userRef = params.userRef ?? null;
    this.#token = params.token || null;
  }

  get data() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      userId: this.userId,
    };
  }

  /**
   * Returns a boolean, true if the user is verified and false if the user is not
   **/
  isUserVerified() {
    return this.#token;
  }

  /**
   * Returns true or false if the password provided matches the user's password
   * @param {string} password - password to match
   **/
  async matchPassword(password) {
    const match = await bcrypt.compare(password, this.#password);

    return !!match ?? false;
  }

  /**
   * Signs and returns jwt token with user data
   **/
  generateJWT() {
    return jwt.sign({ data: this.data }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  }

  /**
   * Generates a verification URL for the user.
   *
   * @returns {URL} - The verification URL with the user's token as a query parameter.
   */
  getVerificationUrl() {
    const userVerificationUrl = new URL("/auth/verify", process.env.BASE_URL);
    userVerificationUrl.searchParams.append("token", this.#token);
    return userVerificationUrl;
  }
}

module.exports = User;
