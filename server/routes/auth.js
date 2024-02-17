const express = require("express");
const router = express.Router();
const signinController = require("../controllers/auth/signin.js");
const signupController = require("../controllers/auth/signup.js");
const verifyTokenController = require("../controllers/auth/verifyToken.js");
const forgotPasswordController = require("../controllers/auth/forgotPassword.js");
const signoutController = require("../controllers/auth/signout.js");
const resetPasswordController = require("../controllers/user/resetPassword.js");
const getResetPasswordController = require("../controllers/auth/getResetPassword.js");

router.post("/signin", signinController);
router.post("/signup", signupController);
router.get("/signout", signoutController);
router.get("/verify", verifyTokenController);
router.post("/forgot-password", forgotPasswordController);
router.patch("/reset-password", resetPasswordController);
router.get("/reset-password", getResetPasswordController);

module.exports = router;
