const router = require("express").Router();
const {generateKey} = require("../controllers/keys");
const authMiddleware = require("../middlewares/auth");

router.post("/generate", authMiddleware, generateKey);

module.exports = router;