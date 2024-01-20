const express = require("express");
const router = express.Router();

const {deleteUserAccountController} = require("../controllers/deleteUserAccount.js");
const authMiddleware = require("../middlewares/auth.js");

router.delete("/",authMiddleware, deleteUserAccountController);

module.exports = router;