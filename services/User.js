const User = require("../models/Users");
const { db } = require("../utils/firestore");

async function fetchUsers () {
	try {
		const usersRef = await db.collection("Users").get();

		const users = usersRef.docs.map(doc => new User(doc));
		
		return {
			data: { users }
		};
	} catch (err) {
		console.log(err);
		throw err;
	}
}

module.exports = {
	fetchUsers
};
