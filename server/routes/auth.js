const router = require("express").Router();
const signinController = require("../controllers/auth/signin.js");
const signupController = require("../controllers/auth/signup.js");
const verifyTokenController = require("../controllers/auth/verify.js");
const forgotPasswordController = require("../controllers/auth/forgot-password.js");
const signoutController = require("../controllers/auth/signout.js");
const ResetPasswordController = require("../controllers/auth/reset-password.js");

router.post("/signin", signinController);
router.post("/signup", signupController);
router.get("/signout", signoutController);
router.get("/verify", verifyTokenController);
router.post("/forgot-password", forgotPasswordController);
router.get("/reset-password", ResetPasswordController.get);
router.patch("/reset-password", ResetPasswordController.patch);

module.exports = router;
