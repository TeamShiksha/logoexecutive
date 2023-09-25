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
		this.createdAt = new Date(params.createdAt);
		this.updatedAt = new Date(params.updatedAt);
	}

	getUserData() {
		return {
			id: this.userId,
			name: `${this.firstName} ${this.lastName}`,
			email: this.email,
		};
	}
}

module.exports = User;
