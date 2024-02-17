const express = require("express");
const router = express.Router();
const signinController = require("../controllers/user/signin.js");
const signupController = require("../controllers/user/signup");
const verifyTokenController = require("../controllers/user/verifyToken.js");
const forgotPasswordController = require("../controllers/user/forgotPassword.js");
const signoutController = require("../controllers/user/signout.js");
const resetPasswordController = require("../controllers/user/resetPassword.js");
const getResetPasswordController = require("../controllers/user/getResetPassword.js");

router.post("/signin", signinController);
router.post("/signup", signupController);
router.get("/signout", signoutController);
router.get("/verify", verifyTokenController);
router.post("/forgot-password", forgotPasswordController);
router.patch("/reset-password", resetPasswordController);
router.get("/reset-password", getResetPasswordController);

module.exports = router;
