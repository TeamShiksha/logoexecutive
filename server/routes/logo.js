const router = require("express").Router();
const { getLogo } = require("../controllers/logos");
const authMiddleWare = require("../middlewares/auth");

router.get("/logo", authMiddleWare, getLogo);

module.exports = router;