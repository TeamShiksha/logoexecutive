const router = require("express").Router();
const revertToCustomerController = require("../controllers/operator/revert");
const authMiddleware = require("../middlewares/auth");

router.put(
  "/revert",
  authMiddleware({ operatorOnly: true }),
  revertToCustomerController
);

module.exports = router;
