const express = require("express");
const router = express.Router();
const userRouter = require("./user");
const contactUsRouter = require("./contactUs");
const authRouter = require("./auth");
const keyRouter = require("./key");
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
router.use("/contact", cors(), contactUsRouter);
router.use("/keys", cors(privateRouteCORS), keyRouter);

module.exports = router;
