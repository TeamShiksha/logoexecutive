const { fetchUsers } = require("../../services/User");
const router = require("express").Router();

router.get("/", async (_, res) => {
	try {
		const { data } = await fetchUsers();

		if (!data) {
			return res.status(404).json({
				error: "Not Found",
				statusCode: 404,
				message: "No user found",
			});
		}

		const users = data.users.map(user => user.getUserData());

		return res.status(200).json({
			data: { users }
		});
	} catch (err) {
		console.log(err);
		throw err;
	}
});

module.exports = router;
