const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const serializer = require("../utils/serializer/serializer");

class User {
	id;
	email;
	name;
	createdAt;
	updatedAt;

	#password;

	constructor(params) {
		this.id = params.id;
		this.email = params.email;
		this.#password = params.password;
		this.name = params.name;
		this.createdAt = params.createdAt;
		this.updatedAt = params.updatedAt;
	}

	get data() {
		return {
			id: this.id,
			name: this.name,
			email: this.email,
			timeStamps: {
				created: this.createdAt.toDate(),
				modified: this.updatedAt.toDate()
			},
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
		return jwt.sign(
			{
				exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
				data: this.data,
			},
			process.env.JWT_SECRET,
		);
	}
}

module.exports = User;
