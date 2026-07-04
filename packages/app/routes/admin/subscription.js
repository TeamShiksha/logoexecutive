const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth");
const {
  changeSubscriptionPlanController,
  listSubscriptionLogsController,
} = require("../../controllers/subscriptions");

/**
 * GET /api/admin/users/subscription/logs
 * Admin-only: paginated list of all subscription plan-change audit logs.
 */
router.get(
  "/subscription/logs",
  authMiddleware({ adminOnly: true }),
  listSubscriptionLogsController
);

/**
 * PATCH /api/admin/users/:userId/subscription
 * Admin-only: upgrade or downgrade a user's subscription plan.
 */
router.patch(
  "/:userId/subscription",
  authMiddleware({ adminOnly: true }),
  changeSubscriptionPlanController
);

module.exports = router;
