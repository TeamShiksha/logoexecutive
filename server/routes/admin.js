const express = require("express");
const router = express.Router();

const addAdminController = require("../controllers/admin/add");

router.put("/add", addAdminController);

module.exports = router;