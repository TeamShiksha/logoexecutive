const router = require("express").Router();
const contactUsController = require("../controllers/public/contact-us");
const demoLogoController = require("../controllers/public/logo");
const demoSearchLogoController = require("../controllers/public/search");
const raiseRequestController = require("../controllers/public/raise-request");

router.post("/contact-us", contactUsController);
router.get("/logo", demoLogoController);
router.get("/search", demoSearchLogoController);
router.post("/logo-request", raiseRequestController);

module.exports = router;
