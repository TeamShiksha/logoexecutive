const express = require("express");
const router = express.Router();
const {submitContactForm} = require("../controllers/contactUs");

router.post("/", submitContactForm);

module.exports = router; 