const express = require("express");
const router = express.Router();
const signinController = require("../controllers/auth/signin");
const signupController = require("../controllers/auth/signup");
const verifyTokenController = require("../controllers/auth/verifyToken");

router.post("/signin", signinController);
router.post("/signup", signupController);
router.get("/verify", verifyTokenController);
module.exports = router;
