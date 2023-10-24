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

/**
 * fetchUserByUsername - Fetches user from provided key
 * @param {string} username - username of the user
 **/
async function fetchUserByUsername(username) {
  try {
    const userRef = await db
      .collection("Users")
      .where("username", "==", username)
      .limit(1)
      .get();

    if (userRef.empty) {
      return null;
    }

		const user = new User(userRef.docs[0].data());

		return user;
  } catch (e) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  fetchUsers,
	fetchUserByUsername
};
