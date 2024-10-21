const router = require("express").Router();
const contactUsController = require("../controllers/public/contact-us");
const demoLogoController = require("../controllers/public/logo");
const demoSearchLogoController = require("../controllers/public/search");

router.post("/contact-us", contactUsController);
router.get("/logo", demoLogoController);
router.get("/search", demoSearchLogoController);

module.exports = router;
