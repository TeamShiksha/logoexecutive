const router = require("express").Router();
const userRouter = require("./user");
const publicRouter = require("./public");
const authRouter = require("./auth");
const logoRouter = require("./business");
const adminRouter = require("./admin");
const operatorRouter = require("./operator");
const cors = require("cors");

const privateRouteCORS = {
  origin: (origin, callback) => {
    if (origin === process.env.CLIENT_PROXY_URL || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

router.use("/auth", cors(privateRouteCORS), authRouter);
router.use("/user", cors(privateRouteCORS), userRouter);
router.use("/admin", cors(privateRouteCORS), adminRouter);
router.use("/public", cors(privateRouteCORS), publicRouter);
router.use("/business", cors({ origin: "*" }), logoRouter);
router.use("/admin", cors(privateRouteCORS), adminRouter);
router.use("/operator", cors(privateRouteCORS), operatorRouter);

module.exports = router;
