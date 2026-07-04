const router = require("express").Router();
const {
  getRewardSummaryForImageController,
  getRewardSummaryForUserController,
  getRewardsLeaderboardController,
  getUserLeaderboardRankController,
  getImageTransactionsController,
  getUserTransactionsController,
  getTransactionController,
  getUserTransactionStatsController,
  getAuditTrailController,
} = require("../controllers/rewards");
const authMiddleware = require("../middlewares/auth");

/**
 * GET /api/rewards/summary/user
 * Retrieves reward summary for the authenticated user
 * - Returns total points, rewards earned, and reward statistics
 * - Requires: authentication
 */
router.get(
  "/summary/user",
  authMiddleware(),
  getRewardSummaryForUserController
);

/**
 * GET /api/rewards/summary/image/:imageId
 * Retrieves reward summary for a specific image
 * - Returns reward details associated with the image
 */
router.get("/summary/image/:imageId", getRewardSummaryForImageController);

/**
 * GET /api/rewards/leaderboard/rank
 * Retrieves the authenticated user's rank in the leaderboard
 * - Returns rank, total points, and total users
 * - Requires: authentication
 */
router.get(
  "/leaderboard/rank",
  authMiddleware(),
  getUserLeaderboardRankController
);

/**
 * GET /api/rewards/leaderboard
 * Retrieves leaderboard of top creators ranked by reward points
 * - Query params: limit (default: 10)
 */
router.get("/leaderboard", getRewardsLeaderboardController);

/**
 * GET /api/rewards/transactions/image/:imageId
 * Retrieves transaction history for a specific image
 * - Query params: page (default: 1), limit (default: 20)
 */
router.get("/transactions/image/:imageId", getImageTransactionsController);

/**
 * GET /api/rewards/transactions/user
 * Retrieves transaction history for the authenticated user
 * - Query params: page (default: 1), limit (default: 20)
 * - Requires: authentication
 */
router.get(
  "/transactions/user",
  authMiddleware(),
  getUserTransactionsController
);

/**
 * GET /api/rewards/transactions/stats/user
 * Get transaction statistics for authenticated user
 * Requires: authentication
 */
router.get(
  "/transactions/stats/user",
  authMiddleware(),
  getUserTransactionStatsController
);

/**
 * GET /api/rewards/transactions/:transactionId
 * Get a specific transaction
 */
router.get("/transactions/:transactionId", getTransactionController);

/**
 * GET /api/rewards/audit-trail/:imageId
 * Get audit trail for a specific image (creator only)
 * Requires: authentication
 */
router.get("/audit-trail/:imageId", authMiddleware(), getAuditTrailController);

module.exports = router;
