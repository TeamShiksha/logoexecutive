const express = require("express");
const router = express.Router();
const userRouter = require("./user");
const contactUsRouter = require("./contactUs");
const authRouter = require("./auth");
const keyRouter = require("./key");
const updateProfileRouter = require("./updateProfile");

router.get("/", (_req, res) =>
  res.status(200).json({ message: "Welcome to Logo executive API" })
);

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/contact", contactUsRouter);
router.use("/keys", keyRouter);
router.use("/update-profile",updateProfileRouter);

module.exports = router;