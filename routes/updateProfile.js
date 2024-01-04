const express = require("express");
const router = express.Router();
const { updateProfileController } = require("../controllers/updateProfile");
const authMiddleware = require("../middlewares/auth");

router.patch("/",authMiddleware, updateProfileController);


module.exports = router;
