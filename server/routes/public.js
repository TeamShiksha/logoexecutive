const router = require("express").Router();
const contactUsController = require("../controllers/public/contact-us");
const demoLogoController = require("../controllers/public/logo");

router.post("/contact-us", contactUsController);
router.get("/logo", demoLogoController);

module.exports = router; 