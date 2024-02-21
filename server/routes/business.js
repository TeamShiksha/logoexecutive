const router = require("express").Router();
const getLogoController = require("../controllers/business/logo");

router.get("/logo", getLogoController);

module.exports = router;
