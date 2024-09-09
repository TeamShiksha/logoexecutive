const router = require("express").Router();
const getLogoController = require("../controllers/business/logo");
const searchLogoController = require("../controllers/business/search");

router.get("/logo", getLogoController);
router.get("/search", searchLogoController);

module.exports = router;
