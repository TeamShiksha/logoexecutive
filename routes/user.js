const router = require("express").Router();
const { getUser, updatePassword } = require("../controllers/users");
const authMiddleware = require("../middlewares/auth");

router.get("/user", authMiddleware, getUser);
router.post("/update-password", authMiddleware, updatePassword);

module.exports = router;
