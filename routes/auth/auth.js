const express = require("express");
const loginController = require("../../controllers/auth/login/login");
const signupController = require("../../controllers/auth/signup/signup");

const router = express.Router();

router.post("/login", loginController);
router.post("/signup", signupController);

module.exports = router;
