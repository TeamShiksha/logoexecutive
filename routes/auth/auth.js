const express = require("express");
const signinController = require("../../controllers/auth/signin/signin");
const signupController = require("../../controllers/auth/signup/signup");
const verifyTokenController = require("../../controllers/auth/verifyToken/verifyToken");
const router = express.Router();

router.post("/signin", signinController);
router.post("/signup", signupController);
router.get("/verify", verifyTokenController);
module.exports = router;
