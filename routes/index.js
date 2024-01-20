const express = require("express");
const router = express.Router();
const userRouter = require("./user");
const contactUsRouter = require("./contactUs");
const authRouter = require("./auth");
const keyRouter = require("./key");
const updateProfileRouter = require("./updateProfile");
const deleteProfileRouter = require("./deleteProfileRouter");

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/contact", contactUsRouter);
router.use("/keys", keyRouter);
router.use("/user/update",updateProfileRouter);
router.use("/user/delete",deleteProfileRouter);

module.exports = router;
