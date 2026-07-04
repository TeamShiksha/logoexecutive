const { STATUS_CODES } = require("node:http");
const mongoose = require("mongoose");
const { Messages } = require("../utils/constants");
const {
  changeSubscriptionPlanSchema,
  listSubscriptionLogsQuerySchema,
} = require("../schemas/admin");
const SubscriptionService = require("../services/subscriptions");
const UsersService = require("../services/users");

/**
 * PATCH /api/admin/users/:userId/subscription
 * Admin-only: upgrade or downgrade a user's subscription plan.
 */
async function changeSubscriptionPlanController(req, res, next) {
  try {
    const session = await mongoose.startSession();
    const subscriptionService = new SubscriptionService();
    const usersService = new UsersService();

    const { error, value } = changeSubscriptionPlanSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(422).json({
        statusCode: 422,
        error: STATUS_CODES[422],
        message: error.details.map((d) => d.message).join(", "),
      });
    }

    const { plan, reason } = value;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_USER_ID,
      });
    }
    const result = await session.withTransaction(async () => {
      const user = await usersService.getUser(userId, { session });
      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          error: STATUS_CODES[404],
          message: Messages.USER_NOT_FOUND,
        });
      }

      const subscription = await subscriptionService.getSubscription(
        user.subscription_id,
        { session }
      );
      if (!subscription) {
        return res.status(404).json({
          statusCode: 404,
          error: STATUS_CODES[404],
          message: Messages.SUBSCRIPTION_NOT_FOUND,
        });
      }

      if (subscription.type === plan) {
        return res.status(400).json({
          statusCode: 400,
          error: STATUS_CODES[400],
          message: Messages.PLAN_ALREADY_ACTIVE,
        });
      }

      const updatedSubscription =
        await subscriptionService.changeSubscriptionPlan(
          user.subscription_id,
          plan,
          { session }
        );

      await subscriptionService.createSubscriptionLog(
        {
          user_id: user._id,
          subscription_id: user.subscription_id,
          from_plan: subscription.type,
          to_plan: plan,
          changed_by: new mongoose.Types.ObjectId(req.userData.userId),
          ...(reason && { reason }),
        },
        { session }
      );
      return updatedSubscription;
    });
    return res.status(200).json({
      statusCode: 200,
      message: Messages.PLAN_CHANGE_SUCCESS,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users/subscription/logs
 * Admin-only: list all subscription plan-change audit logs, paginated.
 */
async function listSubscriptionLogsController(req, res, next) {
  try {
    const subscriptionService = new SubscriptionService();

    const { error, value } = listSubscriptionLogsQuerySchema.validate(
      req.query,
      { abortEarly: false }
    );
    if (error) {
      return res.status(422).json({
        statusCode: 422,
        error: STATUS_CODES[422],
        message: error.details.map((d) => d.message).join(", "),
      });
    }

    const { page, limit } = value;
    const { logs, total, totalPages } =
      await subscriptionService.getSubscriptionLogs(page, limit);

    return res.status(200).json({
      statusCode: 200,
      data: logs,
      total,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  changeSubscriptionPlanController,
  listSubscriptionLogsController,
};
