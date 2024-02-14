const express = require("express");
const router = express.Router();
const userRouter = require("./user");
const contactUsRouter = require("./contactUs");
const authRouter = require("./auth");
const keyRouter = require("./key");
const logoRouter = require("./logo");
const cors = require("cors");

const privateRouteCORS = {
  origin: (origin, callback) => {
    if(origin === process.env.BASE_URL || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

router.use("/auth", cors(privateRouteCORS), authRouter);
router.use("/users", cors(privateRouteCORS),userRouter);
router.use("/contact", cors(privateRouteCORS), contactUsRouter);
router.use("/keys", cors(privateRouteCORS), keyRouter);

// Business API - logo
router.use("/images", logoRouter);

module.exports = router;