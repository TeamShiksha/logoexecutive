const express = require("express");
const router = express.Router();
const userRouter = require("./user");
const contactUsRouter = require("./contactUs");
const authRouter = require("./auth");
const keyRouter = require("./key");
const logoRouter = require("./logo");

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/contact", contactUsRouter);
router.use("/keys", keyRouter);

// Business API - logo
router.use("/images", logoRouter);

module.exports = router;