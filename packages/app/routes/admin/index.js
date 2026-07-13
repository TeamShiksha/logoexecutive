const router = require("express").Router();
const usersRouter = require("./users");
const subscriptionRouter = require("./subscription");

router.use("/", usersRouter);
router.use("/", subscriptionRouter);

module.exports = router;
