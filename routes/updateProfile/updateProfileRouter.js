const express = require("express");
const router = express.Router();
const { updateProfileController, verifyAndUpdateEmailController } = require("../../controllers/updateProfile/updateProfile");
const authMiddleware = require("../../middlewares/auth/auth");



router.post("/",authMiddleware, updateProfileController);

router.get("/verifyAndUpdateEmail", 
  verifyAndUpdateEmailController);

module.exports = router;