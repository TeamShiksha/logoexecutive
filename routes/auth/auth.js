const express = require("express");
const loginController = require("../../controllers/auth/login/login");

const router = express.Router();

router.post("/login", loginController);

module.exports = router;
