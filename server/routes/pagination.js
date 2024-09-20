const router = require("express").Router();
const authMiddleware = require("../middlewares/auth");
const getOperatorDataController = require("../controllers/operator/data");

router.get("/pagination", authMiddleware({ operatorOnly: true }), getOperatorDataController);

module.exports = router;
