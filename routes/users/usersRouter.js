const router = require("express").Router();
const { getUsers, updatePassword } = require("../../controllers/users/users");

router.get("/", getUsers);
router.post("/update-password", updatePassword);

module.exports = router;
