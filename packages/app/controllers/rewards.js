const { STATUS_CODES } = require("node:http");
const mongoose = require("mongoose");
const { RewardsService } = require("../services");
const { Messages, RewardMessages, UserType } = require("../utils/constants");

/**
 * Retrieves reward summary for a specific image
 * - Returns reward details associated with an image
 */
async function getRewardSummaryForImageController(req, res, next) {
  try {
    const rewardsService = new RewardsService();
    const { imageId } = req.params;
    if (!imageId || imageId.length === 0) {
      return res.status(400).send({
        statusCode: 400,
        message: RewardMessages.IMAGE_ID_REQUIRED,
        error: STATUS_CODES[400],
      });
    }
    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_ID,
      });
    }
    const summary = await rewardsService.getRewardSummaryForImage(imageId);
    if (!summary) {
      return res.status(404).json({
        message: RewardMessages.IMAGE_NOT_FOUND,
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves reward summary for the authenticated user (creator)
 * - Returns total points, rewards earned, and reward statistics
 * - Requires: authentication
 */
async function getRewardSummaryForUserController(req, res, next) {
  try {
    const rewardsService = new RewardsService();
    const userId = req.userData.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_USER_ID,
      });
    }

    const summary = await rewardsService.getUserRewardData(userId);
    if (!summary) {
      return res.status(404).json({
        message: Messages.USER_NOT_FOUND,
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves leaderboard of top creators ranked by reward points
 * - Query params: limit (default: 10)
 */
async function getRewardsLeaderboardController(req, res, next) {
  try {
    const rewardsService = new RewardsService();
    const limit = Number.parseInt(req.query.limit) || 10;

    const leaderboard = await rewardsService.getRewardsLeaderboard(limit);

    return res.status(200).json({
      statusCode: 200,
      data: leaderboard,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves the authenticated user's rank in the leaderboard
 * - Returns rank, total points, and total users
 * - Requires: authentication
 */
async function getUserLeaderboardRankController(req, res, next) {
  try {
    const rewardsService = new RewardsService();
    const userId = req.userData.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_USER_ID,
      });
    }

    const rankData = await rewardsService.getUserLeaderboardRank(userId);
    if (!rankData) {
      return res.status(404).json({
        statusCode: 404,
        message: Messages.USER_NOT_FOUND,
        error: STATUS_CODES[404],
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: rankData,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves transaction history for a specific image
 * - Query params: page (default: 1), limit (default: 20)
 */
async function getImageTransactionsController(req, res, next) {
  try {
    const rewardsService = new RewardsService();
    const { imageId } = req.params;
    if (!imageId || imageId.length === 0) {
      return res.status(400).send({
        statusCode: 400,
        message: RewardMessages.IMAGE_ID_REQUIRED,
        error: STATUS_CODES[400],
      });
    }
    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_ID,
      });
    }
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;

    const transactions = await rewardsService.getImageTransactions(
      imageId,
      page,
      limit
    );

    return res.status(200).json({
      statusCode: 200,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves transaction history for the authenticated user
 * - Query params: page (default: 1), limit (default: 20)
 * - Requires: authentication
 */
async function getUserTransactionsController(req, res, next) {
  try {
    const rewardsService = new RewardsService();
    const userId = req.userData.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_USER_ID,
      });
    }

    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;

    const transactions = await rewardsService.getUserTransactions(
      userId,
      page,
      limit
    );
    if (!transactions) {
      return res.status(404).json({
        statusCode: 404,
        message: RewardMessages.TRANSACTION_NOT_FOUND,
        error: STATUS_CODES[404],
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves details of a specific transaction by ID
 */
async function getTransactionController(req, res, next) {
  try {
    const rewardsService = new RewardsService();
    const { transactionId } = req.params;
    if (!transactionId || transactionId.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        message: RewardMessages.TRANSACTION_ID_REQUIRED,
        error: STATUS_CODES[400],
      });
    }
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_ID,
      });
    }

    const transaction = await rewardsService.getTransaction(transactionId);

    if (!transaction) {
      return res.status(404).json({
        message: RewardMessages.TRANSACTION_NOT_FOUND,
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    }

    const { userId, role } = req.userData;
    const isParticipant = [transaction.user_id, transaction.creator_id].some(
      (id) => id && id.toString() === userId
    );
    if (role !== UserType.ADMIN && !isParticipant) {
      return res.status(403).json({
        statusCode: 403,
        error: STATUS_CODES[403],
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves transaction statistics for the authenticated user
 * - Returns aggregated data like total points, transaction counts, etc.
 * - Requires: authentication
 */
async function getUserTransactionStatsController(req, res, next) {
  try {
    const rewardsService = new RewardsService();
    const userId = req.userData.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_USER_ID,
      });
    }

    const stats = await rewardsService.getUserTransactionStats(userId);

    return res.status(200).json({
      statusCode: 200,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves audit trail for a specific image
 * - Shows reward-related changes and history for the image
 * - Requires: authentication
 */
async function getAuditTrailController(req, res, next) {
  try {
    const rewardsService = new RewardsService();
    const { imageId } = req.params;
    const userId = req.userData.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_USER_ID,
      });
    }

    if (!imageId || imageId.length === 0) {
      return res.status(400).send({
        statusCode: 400,
        message: RewardMessages.IMAGE_ID_REQUIRED,
        error: STATUS_CODES[400],
      });
    }
    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_ID,
      });
    }

    const auditTrail = await rewardsService.getAuditTrail(imageId, userId);

    return res.status(200).json({
      statusCode: 200,
      data: auditTrail,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Searches transactions with multiple filter options
 * - Query params: userId, imageId, type, isReversed, reason, startDate, endDate, page, limit
 * - Requires: authentication, admin role
 */
async function searchTransactionsController(req, res, next) {
  try {
    const rewardsService = new RewardsService();
    const userId = req.query.userId || null;
    const imageId = req.query.imageId || null;

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_USER_ID,
      });
    }

    if (imageId && !mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_ID,
      });
    }

    const filters = {
      userId,
      imageId,
      transactionType: req.query.type || null,
      isReversed: req.query.isReversed
        ? req.query.isReversed === "true"
        : undefined,
      reason: req.query.reason || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;

    Object.keys(filters).forEach(
      (key) => filters[key] === null && delete filters[key]
    );

    const results = await rewardsService.searchTransactions(
      filters,
      page,
      limit
    );

    return res.status(200).json({
      statusCode: 200,
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Awards bonus reward points to a user for a specific image
 * - Body: { imageId, userId, points, reason, description }
 * - Requires: authentication, admin role
 */
async function awardBonusPointsController(req, res, next) {
  try {
    const rewardsService = new RewardsService();
    const { imageId, userId, points, reason, description } = req.body;

    if (!imageId || !userId || !points) {
      return res.status(400).json({
        message: RewardMessages.MISSING_BONUS_FIELDS,
        statusCode: 400,
        error: STATUS_CODES[400],
      });
    }

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_ID,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_USER_ID,
      });
    }

    if (points <= 0) {
      return res.status(400).json({
        message: RewardMessages.POINTS_MUST_BE_POSITIVE,
        statusCode: 400,
        error: STATUS_CODES[400],
      });
    }

    const transaction = await rewardsService.awardBonusPoints(
      imageId,
      userId,
      points,
      reason,
      description
    );
    if (!transaction) {
      return res.status(500).json({
        statusCode: 500,
        message: Messages.INTERNAL_SERVER_ERROR,
        error: STATUS_CODES[500],
      });
    }

    return res.status(201).json({
      statusCode: 201,
      data: transaction,
      message: RewardMessages.BONUS_AWARDED,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reverses/undoes a specific reward transaction
 * - Body: { reason }
 * - Requires: authentication, admin role
 */
async function reverseTransactionController(req, res, next) {
  try {
    const rewardsService = new RewardsService();
    const { transactionId } = req.params;
    const { reason } = req.body;
    const reversedBy = req.userData.userId;

    if (!transactionId || transactionId.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        message: RewardMessages.TRANSACTION_ID_REQUIRED,
        error: STATUS_CODES[400],
      });
    }
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_ID,
      });
    }

    if (!reversedBy || !mongoose.Types.ObjectId.isValid(reversedBy)) {
      return res.status(400).json({
        statusCode: 400,
        error: STATUS_CODES[400],
        message: Messages.INVALID_USER_ID,
      });
    }

    if (!reason) {
      return res.status(400).json({
        message: RewardMessages.REVERSAL_REASON_REQUIRED,
        statusCode: 400,
        error: STATUS_CODES[400],
      });
    }

    const reversedTransaction = await rewardsService.reverseTransaction(
      transactionId,
      reversedBy,
      reason
    );
    if (!reversedTransaction) {
      return res.status(404).json({
        statusCode: 404,
        message: RewardMessages.TRANSACTION_NOT_FOUND,
        error: STATUS_CODES[404],
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: reversedTransaction,
      message: RewardMessages.TRANSACTION_REVERSED,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRewardSummaryForImageController,
  getRewardSummaryForUserController,
  getRewardsLeaderboardController,
  getUserLeaderboardRankController,
  getImageTransactionsController,
  getUserTransactionsController,
  getTransactionController,
  getUserTransactionStatsController,
  getAuditTrailController,
  searchTransactionsController,
  awardBonusPointsController,
  reverseTransactionController,
};
