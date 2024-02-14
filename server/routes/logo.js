const router = require("express").Router();
const { getLogo } = require("../controllers/logos");

router.get("/logo", getLogo);

module.exports = router;