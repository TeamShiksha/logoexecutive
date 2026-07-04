const router = require("express").Router();
const cors = require("cors");
const operatorRouter = require("./operator");
const userRouter = require("./users");
const authRouter = require("./auth");
const businessRouter = require("./logo");
const adminRouter = require("./catalog");
const requestRouter = require("./request");
const logoRequestLogsRouter = require("./logoRequestLogs");
const { logoLimiter, baseLimiter } = require("../middlewares/rateLimiter");
const createLogoRequestRouter = require("./createLogoRequest");
const rewardsRouter = require("./rewards");
const adminRewardsRouter = require("./admin/rewards");
const adminMilestonesRouter = require("./admin/milestoneConfig");
const adminUsersRouter = require("./admin");

const privateRouteCORS = {
  origin: (origin, callback) => {
    if (origin === process.env.CLIENT_URL || !origin) {
      callback(null, true);
    } else {
      console.error(
        `origin=${origin} and CLIENT_URL=${process.env.CLIENT_URL} do not match..`
      );
      console.error(
        "What is cors ? Learn here: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"
      );
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

router.use("/messages", baseLimiter, cors(privateRouteCORS), operatorRouter);
router.use("/user", baseLimiter, cors(privateRouteCORS), userRouter);
router.use("/auth", baseLimiter, cors(privateRouteCORS), authRouter);
router.use("/logo", logoLimiter, cors(privateRouteCORS), businessRouter);
router.use("/catalog", baseLimiter, cors(privateRouteCORS), adminRouter);
router.use("/requests", baseLimiter, cors(privateRouteCORS), requestRouter);
router.use(
  "/logo-requests",
  baseLimiter,
  cors(privateRouteCORS),
  logoRequestLogsRouter
);
router.use(
  "/create-logo-request",
  baseLimiter,
  cors(privateRouteCORS),
  createLogoRequestRouter
);
router.use("/rewards", baseLimiter, cors(privateRouteCORS), rewardsRouter);
router.use(
  "/admin/rewards",
  baseLimiter,
  cors(privateRouteCORS),
  adminRewardsRouter
);
router.use(
  "/admin/users",
  baseLimiter,
  cors(privateRouteCORS),
  adminUsersRouter
);

router.use(
  "/admin/milestones",
  baseLimiter,
  cors(privateRouteCORS),
  adminMilestonesRouter
);
module.exports = router;
