const express = require("express");
const router = express.Router();
const signinController = require("../controllers/auth/signin");
const signupController = require("../controllers/auth/signup");
const verifyTokenController = require("../controllers/auth/verifyToken");
const forgotPasswordController = require("../controllers/auth/forgotPassword");

router.post("/signin", signinController);
router.post("/signup", signupController);
router.get("/verify", verifyTokenController);
router.post("/forgot-password", forgotPasswordController);

module.exports = router;
