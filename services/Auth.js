const { db } = require("../utils/firestore");

/**
 * Checks if provided email exists in the db
 * @param {string} email
 * @returns {Promise<boolean>} true if email already exists and else false
 **/
async function emailRecordExists(email) {
	try {
		const userRef = await db
			.collection("Users")
			.where("email", "==", email)
			.get();

		return !userRef.empty;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

module.exports = {
	emailRecordExists,
};
