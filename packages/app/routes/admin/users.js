const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth");
const { listUsersController } = require("../../controllers/users");

/**
 * GET /api/admin/users
 * Admin-only: list all CUSTOMER users with their subscription details.
 * Supports ?search=, ?page=, ?limit=, ?includeDeleted=
 */
router.get("/", authMiddleware({ adminOnly: true }), listUsersController);

module.exports = router;
