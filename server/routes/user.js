const router = require("express").Router();
const { getUser, updatePassword } = require("../controllers/users");
const authMiddleware = require("../middlewares/auth");
const { updateProfileController } = require("../controllers/updateProfile");
const {deleteUserAccountController} = require("../controllers/deleteUserAccount.js");

router.get("/user", authMiddleware, getUser);
router.post("/update-password", authMiddleware, updatePassword);
router.patch("/update", authMiddleware, updateProfileController);
router.delete("/delete", authMiddleware, deleteUserAccountController);


module.exports = router;
