const express = require("express");
const router = express.Router();
const signinController = require("../controllers/auth/signin");
const signupController = require("../controllers/auth/signup");
const verifyTokenController = require("../controllers/auth/verifyToken");
const forgotPasswordController = require("../controllers/auth/forgotPassword");
const signoutController = require("../controllers/auth/signout");
const resetPasswordController = require("../controllers/auth/resetPassword");
const getResetPasswordController = require("../controllers/auth/getResetPassword.js");

router.post("/signin", signinController);
router.post("/signup", signupController);
router.get("/signout", signoutController);
router.get("/verify", verifyTokenController);
router.post("/forgot-password", forgotPasswordController);
router.patch("/reset-password", resetPasswordController);
router.get("/reset-password", getResetPasswordController);

module.exports = router;