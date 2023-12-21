const router = require("express").Router();
const {generateKey} = require("../controllers/keys");
const authMiddleware = require("../middlewares/auth");
const {destroyKeyController} = require("../controllers/keys");

router.post("/generate", authMiddleware, generateKey);
router.delete("/destroy", authMiddleware, destroyKeyController);

module.exports = router;