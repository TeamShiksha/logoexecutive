const router = require("express").Router();
const { getUser, updatePassword } = require("../controllers/user/users.js");
const authMiddleware = require("../middlewares/auth");
const {
  updateProfileController,
} = require("../controllers/user/updateProfile.js");
const {
  deleteUserAccountController,
} = require("../controllers/user/deleteUserAccount.js");

router.get("/user", authMiddleware, getUser);
router.post("/update-password", authMiddleware, updatePassword);
router.patch("/update", authMiddleware, updateProfileController);
router.delete("/delete", authMiddleware, deleteUserAccountController);

module.exports = router;
