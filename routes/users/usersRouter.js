const router = require("express").Router();
const { getUsers, updatePassword } = require("../../controllers/users/users");
const authMiddleware = require("../../middlewares/auth/auth");

router.get("/", getUsers);
router.post("/update-password", authMiddleware, updatePassword);

module.exports = router;
