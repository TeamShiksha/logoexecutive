const express = require("express");

const addAdminController = require("../controllers/admin/add");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.put("/add", authMiddleware, addAdminController);

module.exports = router;