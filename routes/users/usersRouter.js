const router = require("express").Router();
require("dotenv").config();
const { getUsers } = require("../../controllers/users/users");
const { changeNameEmail } = require("../../controllers/users/users");
const { updateUserNameEmail } = require("../../controllers/users/users");

router.get("/", getUsers);
router.post("/change-name-email/:curr_email",changeNameEmail);
router.get("/:curr_email/verify", updateUserNameEmail);


module.exports = router;
