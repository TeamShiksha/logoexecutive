const express = require("express");

const addAdminController = require("../controllers/admin/add");

const router = express.Router();

router.put("/add", addAdminController);

module.exports = router;