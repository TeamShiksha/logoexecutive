const router = require("express").Router();
const {
  getLogoController,
  searchLogoController,
  demoSearchLogoController,
} = require("../controllers/logo");
const resetSubscription = require("../middlewares/resetSubscription");

router.get(
  "/",
  (req, res, next) => resetSubscription(req, res, next),
  getLogoController
);
router.get(
  "/search",
  (req, res, next) => resetSubscription(req, res, next),
  searchLogoController
);
router.get("/demo-search", demoSearchLogoController);

module.exports = router;
