const express = require("express");

const auth = require("./auth");

const router = express.Router();

router.get("/", (_req, res) =>
  res.status(200).json({message: "Welcome to Logo executive API"})
);

router.use("/auth", auth);

module.exports = router;
