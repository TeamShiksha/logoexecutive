const router = require("express").Router();
const authMiddleware = require("../middlewares/auth");
const updatePasswordController  = require("../controllers/user/update-password.js");
const getUserDataController = require("../controllers/user/data.js");
const generateKeyController = require("../controllers/user/generate");
const destroyKeyController = require("../controllers/user/destroy");
const resetPasswordController = require("../controllers/user/reset-password.js");
const updateProfileController = require("../controllers/user/update-profile.js");
const deleteUserAccountController = require("../controllers/user/delete.js");

router.get("/data", authMiddleware, getUserDataController);
router.post("/update-password", authMiddleware, updatePasswordController);
router.patch("/update-profile", authMiddleware, updateProfileController);
router.delete("/delete", authMiddleware, deleteUserAccountController);
router.post("/generate", authMiddleware, generateKeyController);
router.delete("/destroy", authMiddleware, destroyKeyController);
router.patch("/reset-password", authMiddleware, resetPasswordController);

module.exports = router;
