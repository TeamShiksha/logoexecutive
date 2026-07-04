const router = require("express").Router();
const {
  searchTransactionsController,
  awardBonusPointsController,
  reverseTransactionController,
} = require("../../controllers/rewards");
const authMiddleware = require("../../middlewares/auth");

/**
 * GET /api/admin/rewards/transactions/search
 * Searches transactions with multiple filter options (admin only)
 * - Query params: userId, imageId, type, isReversed, reason, startDate, endDate, page, limit
 * - Requires: authentication, admin role
 */
router.get(
  "/transactions/search",
  authMiddleware({ adminOnly: true }),
  searchTransactionsController
);

/**
 * POST /api/admin/rewards/bonus
 * Award bonus points to a user (admin only)
 * - Body: { imageId, userId, points, reason, description }
 * - Requires: authentication, admin role
 */
router.post(
  "/bonus",
  authMiddleware({ adminOnly: true }),
  awardBonusPointsController
);

/**
 * POST /api/admin/rewards/transactions/:transactionId/reverse
 * Reverse a transaction (admin only)
 * - Body: { reason }
 * - Requires: authentication, admin role
 */
router.post(
  "/transactions/:transactionId/reverse",
  authMiddleware({ adminOnly: true }),
  reverseTransactionController
);

module.exports = router;
