const express = require("express");
const router = express.Router();
const {submitContactUs} = require("../controllers/contactUs");

router.post("/", submitContactUs);

module.exports = router; 