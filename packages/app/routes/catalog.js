const router = require("express").Router();
const authMiddleware = require("../middlewares/auth");
const {
  addPermissionController,
  getCatalogController,
  getPreSignedController,
  updateCatalogController,
  addCatalogController,
  getAnalyticsController,
} = require("../controllers/catalog");
const { uploadLimiter } = require("../middlewares/rateLimiter");
const { UserType } = require("../utils/constants");

router.put(
  "/permission/:userId/roles/:role",
  authMiddleware({ adminOnly: true }),
  addPermissionController
);

router.get(
  "/stats",
  authMiddleware({ adminOnly: true }),
  getAnalyticsController
);
router.get(
  "/logos",
  authMiddleware({ roles: [UserType.ADMIN, UserType.OPERATOR] }),
  getCatalogController
);

router.post(
  "/logo",
  authMiddleware({ roles: [UserType.ADMIN, UserType.OPERATOR] }),
  addCatalogController
);

router.post(
  "/signed-url",
  uploadLimiter,
  authMiddleware({ roles: [UserType.ADMIN, UserType.OPERATOR] }),
  getPreSignedController
);

router.put(
  "/logo",
  authMiddleware({ roles: [UserType.ADMIN, UserType.OPERATOR] }),
  updateCatalogController
);

module.exports = router;
