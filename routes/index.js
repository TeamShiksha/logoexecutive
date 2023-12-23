const express = require("express");
const router = express.Router();
const userRouter = require("./user");
const contactUsRouter = require("./contactUs");
const authRouter = require("./auth");
const keyRouter = require("./key");

router.get("/", (_req, res) =>
  res.status(200).json({ message: "Welcome to Logo executive API" })
);

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/contact", contactUsRouter);
router.use("/keys", keyRouter);

module.exports = router;