const router = require("express").Router();
const { getUsers, updatePassword } = require("../controllers/users");
const authMiddleware = require("../middlewares/auth");

router.get("/", getUsers);
router.post("/update-password", authMiddleware, updatePassword);

module.exports = router;
