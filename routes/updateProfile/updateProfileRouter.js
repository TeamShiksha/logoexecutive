const express = require("express");
const router = express.Router();
const { updateProfileController, verifyAndUpdateEmailController } = require("../../controllers/updateProfile/updateProfile");


router.post("/", updateProfileController);

router.get("/verifyAndUpdateEmail", 
  verifyAndUpdateEmailController);

module.exports = router;