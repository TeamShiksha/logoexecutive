const express = require("express");
const userRouter = require("./users/usersRouter");

const auth = require("../routes/auth/auth");

const router = express.Router();

router.get("/", (_req, res) =>
  res.status(200).json({message: "Welcome to Logo executive API"})
);

router.use("/auth", auth);
router.use("/users", userRouter);

module.exports = router;
