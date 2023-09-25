const express = require("express");
const jwt = require("jsonwebtoken");

const { users } = require("../../db/index");

const router = express.Router();

const secret = process.env.JWT_SECRET;

router.post("/login", (req, res) => {
	const { username, password } = req.body.user;
	const foundUser = users.find(
		(user) => user.username === username && user.password === password
	);
	if (foundUser) {
		const token = jwt.sign({ username }, secret, {
			expiresIn: "24h",
		});
		res.status(200).json({ token });
	}
	res.status(401).json({ message: "user not found" });
});

module.exports = router;
