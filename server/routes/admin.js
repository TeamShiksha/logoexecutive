const router = require("express").Router();
const addAdminController = require("../controllers/admin/add");
const authMiddleware = require("../middlewares/auth");

router.put("/add", authMiddleware, addAdminController);

module.exports = router;
