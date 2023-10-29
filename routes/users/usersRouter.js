const router = require("express").Router();
const { getUsers } = require("../../controllers/users/users");

router.get("/", getUsers);

module.exports = router;
