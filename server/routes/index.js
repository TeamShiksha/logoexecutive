const router = require("express").Router();
const userRouter = require("./user");
const publicRouter = require("./public");
const authRouter = require("./auth");
const logoRouter = require("./business");
const adminRouter = require("./admin");
const cors = require("cors");

const privateRouteCORS = {
  origin: (origin, callback) => {
    console.log(origin, process.env.BASE_URL);
    if(origin === process.env.BASE_URL || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

router.use("/auth", cors(privateRouteCORS), authRouter);
router.use("/user", cors(privateRouteCORS),userRouter);
router.use("/admin", cors(privateRouteCORS),adminRouter);
router.use("/public", cors(privateRouteCORS), publicRouter);
router.use("/business", logoRouter);
router.use("/admin", cors(privateRouteCORS), adminRouter);

module.exports = router;
