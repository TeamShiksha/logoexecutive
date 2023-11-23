const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { URL } = require("url");

class User {
  id;
  email;
  firstName;
  lastName;
  createdAt;
  updatedAt;
  #token;

  #password;

  constructor(params) {
    this.id = params.id;
    this.email = params.email;
    this.#password = params.password;
    this.firstName = params.firstName;
    this.lastName = params.lastName ?? "";
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.#token = params?.token;
  }

  get data() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      timeStamps: {
        created: this.createdAt.toDate(),
        modified: this.updatedAt.toDate(),
      },
    };
  }

  /**
   * Returns a boolean, true if the user is verified and false if the user is not
   **/
  isUserVerified() {
    return !this.#token;
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
    return jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        data: this.data,
      },
      process.env.JWT_SECRET
    );
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
