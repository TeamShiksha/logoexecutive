const bcrypt = require("bcrypt");
const { DocumentReference, Timestamp } = require("firebase-admin/firestore");
const jwt = require("jsonwebtoken");

class User {
  userId;
  email;
  firstName;
  lastName;
  createdAt;
  updatedAt;
  userRef;

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
   * Creates a firestore compatible object with current time for createdAt
   * and updatedAt using Firebase Timestamp
   *
   * @param {Object} userData
   * @param {string} userData.email
   * @param {string} userData.firstName
   * @param {string} userData.lastName
   * @param {string} userData.password
   **/
  static NewUser = async (userData) => {
    try {
      const { email, firstName, lastName, password } = userData;
      if (!email || !firstName || !lastName || !password) {
        return null;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      return {
        userId: crypto.randomUUID(/-/g, ""),
        email,
        firstName,
        lastName,
        password: hashedPassword,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
    } catch (err) {
      console.log(err);
      return null;
    }
  };

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
}

module.exports = User;
