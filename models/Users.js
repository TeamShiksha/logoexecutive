const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class User {
	userId;
	email;
	username;
	#password;
	firstName;
	lastName;
	createdAt;
	updatedAt;

	constructor(params) {
		this.userId = params.userId;
		this.email = params.email;
		this.#password = params.password;
		this.firstName = params.firstName;
		this.lastName = params.lastName;
		this.createdAt = new Date().now;
		this.updatedAt = new Date().now;
	}

	getUserData() {
		return {
			id: this.userId,
			username: this.username,
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
		};
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
		return jwt.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), data: this.getUserData() }, process.env.JWT_SECRET);
	}
}

module.exports = User;
