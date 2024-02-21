const router = require("express").Router();
const contactUsController = require("../controllers/public/contact-us");

router.post("/contact-us", contactUsController);

module.exports = router; 