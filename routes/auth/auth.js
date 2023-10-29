const express = require("express");
const signinController = require("../../controllers/auth/signin/signin");
const signupController = require("../../controllers/auth/signup/signup");

const router = express.Router();

router.post("/signin", signinController);
router.post("/signup", signupController);

module.exports = router;
