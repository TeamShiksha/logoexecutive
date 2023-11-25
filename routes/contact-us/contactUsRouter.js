const express = require("express");
const router = express.Router();
const {submitContactUs} = require("../../controllers/contact-us/contactUs");

router.post("/", submitContactUs);

module.exports = router; 