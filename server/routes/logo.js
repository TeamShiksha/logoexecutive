const router = require("express").Router();
const { getLogo } = require("../controllers/business/logos");

router.get("/logo", getLogo);

module.exports = router;
