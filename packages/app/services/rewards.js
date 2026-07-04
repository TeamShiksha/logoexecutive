const {
  RewardsRepository,
  UsersRepository,
  LogoRequestLogsRepository,
  ImagesRepository,
  RewardTransactionsRepository,
  MilestoneConfigRepository,
} = require("../repositories");
const { cloudFrontSignedURL } = require("../utils/cloudFront");

class RewardsService {
  constructor() {
    this.rewardsRepository = new RewardsRepository();
    this.usersRepository = new UsersRepository();
    this.logoRequestLogsRepository = new LogoRequestLogsRepository();
    this.imagesRepository = new ImagesRepository();
    this.rewardTransactionsRepository = new RewardTransactionsRepository();
    this.milestoneConfigRepository = new MilestoneConfigRepository();
  }

  /**
   * Calculates and issues rewards for a logo based on unique Pro user count
   * @param {string} imageId - The image ID to process
   * @returns {Promise<Object>} - Processing result with details
   */
  async processRewardsForImage(imageId) {
    const mongoose = require("mongoose");
    const session = await mongoose.startSession();

    try {
      let result;
      await session.withTransaction(async () => {
        const { milestoneConfig, image, eligibleRequests, reward } =
          await this._loadRewardData(imageId, session);

        const creatorId = image.user_id;
        const { newUsers, previousCount, newCount } = this._computeNewUsers(
          eligibleRequests,
          reward
        );

        if (newUsers.length === 0) {
          await this._markImageCompleted(imageId, session);
          result = this._buildResult(
            imageId,
            creatorId,
            previousCount,
            newCount,
            [],
            [],
            0
          );
          return;
        }

        const newMilestones = this._computeNewMilestones(
          newCount,
          reward,
          milestoneConfig
        );
        const totalNewPoints = newMilestones.reduce(
          (sum, m) => sum + m.points_awarded,
          0
        );

        await this._applyRewardUpdates(
          reward,
          creatorId,
          imageId,
          newUsers,
          newMilestones,
          totalNewPoints,
          session
        );

        if (newMilestones.length > 0) {
          await this._createMilestoneTransactions(
            imageId,
            creatorId,
            reward,
            newMilestones,
            previousCount,
            newCount,
            session
          );
        }

        result = this._buildResult(
          imageId,
          creatorId,
          previousCount,
          newCount,
          newUsers,
          newMilestones,
          totalNewPoints
        );
      });

      return result;
    } catch (error) {
      console.error(
        `[RewardsService] Error processing rewards for image ${imageId}:`,
        error
      );
      return {
        success: false,
        imageId,
        error: error.message,
      };
    } finally {
      session.endSession();
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  async _loadRewardData(imageId, session) {
    const milestoneConfig = await this.milestoneConfigRepository.findActive({
      session,
    });
    if (!milestoneConfig) {
      throw new Error("No active MilestoneConfig found. Aborting.");
    }

    const image = await this.imagesRepository.getById(imageId, { session });
    if (!image) {
      throw new Error("Image not found");
    }

    const eligibleRequests = await this.logoRequestLogsRepository.find(
      { image_id: imageId, is_reward_eligible: true },
      { session }
    );

    const reward = await this.rewardsRepository.findOrCreateByImageId(
      imageId,
      image.user_id,
      { session }
    );

    return { milestoneConfig, image, eligibleRequests, reward };
  }

  _computeNewUsers(eligibleRequests, reward) {
    const existingUserIds = new Set(
      reward.unique_pro_users.map((uid) => uid.toString())
    );

    const newUsers = eligibleRequests
      .filter((req) => !existingUserIds.has(req.user_id.toString()))
      .map((req) => req.user_id);

    const previousCount = reward.unique_pro_users_count || 0;
    const newCount = previousCount + newUsers.length;

    return { newUsers, previousCount, newCount };
  }

  _computeNewMilestones(newCount, reward, milestoneConfig) {
    const alreadyAchieved = new Set(
      reward.milestones_achieved.map((m) => m.milestone)
    );

    return milestoneConfig.thresholds
      .filter((t) => t.at <= newCount && !alreadyAchieved.has(t.at))
      .map((t) => ({
        milestone: t.at,
        achieved_at: new Date(),
        points_awarded: t.points,
      }));
  }

  async _applyRewardUpdates(
    reward,
    creatorId,
    imageId,
    newUsers,
    newMilestones,
    totalNewPoints,
    session
  ) {
    const rewardUpdate = {
      $push: { unique_pro_users: { $each: newUsers } },
      $inc: { unique_pro_users_count: newUsers.length },
      $set: { updated_at: new Date() },
    };

    if (newMilestones.length > 0) {
      rewardUpdate.$inc.total_points_awarded = totalNewPoints;
      rewardUpdate.$addToSet = {
        milestones_achieved: { $each: newMilestones },
      };
    }

    await this.rewardsRepository.update(reward._id, rewardUpdate, { session });

    if (newMilestones.length > 0) {
      await this.usersRepository.update(
        creatorId,
        {
          $inc: {
            reward_points_current: totalNewPoints,
            reward_points_lifetime: totalNewPoints,
          },
          $set: { updated_at: new Date() },
        },
        { session }
      );
    }

    await this._markImageCompleted(imageId, session);
  }

  async _createMilestoneTransactions(
    imageId,
    creatorId,
    reward,
    newMilestones,
    previousCount,
    newCount,
    session
  ) {
    const previousTotal = reward.total_points_awarded || 0;

    const transactions = newMilestones.map((milestone, index) => ({
      image_id: imageId,
      user_id: creatorId,
      transaction_type: "MILESTONE_REWARD",
      milestone: milestone.milestone,
      points_awarded: milestone.points_awarded,
      description: `Milestone ${milestone.milestone} reached - ${milestone.milestone} unique Pro users`,
      reason: "NORMAL_MILESTONE",
      previous_total:
        previousTotal +
        (index > 0
          ? newMilestones
              .slice(0, index)
              .reduce((sum, m) => sum + m.points_awarded, 0)
          : 0),
      new_total:
        previousTotal +
        newMilestones
          .slice(0, index + 1)
          .reduce((sum, m) => sum + m.points_awarded, 0),
      is_reversed: false,
      metadata: {
        unique_pro_users_count: newCount,
        processed_at: new Date(),
      },
    }));

    await Promise.all(
      transactions.map((t) =>
        this.rewardTransactionsRepository.createTransaction(t, { session })
      )
    );
  }

  async _markImageCompleted(imageId, session) {
    await this.imagesRepository.update(
      imageId,
      { has_pending_reward: false },
      { session }
    );
  }

  _buildResult(
    imageId,
    creatorId,
    previousCount,
    newCount,
    newUsers,
    newMilestones,
    totalNewPoints
  ) {
    if (newUsers.length === 0) {
      return {
        success: true,
        imageId,
        creatorId,
        newUsersAdded: 0,
        newMilestones: [],
        totalPointsAwarded: 0,
        message: "No new users found",
      };
    }

    return {
      success: true,
      imageId,
      creatorId,
      previousUniqueCount: previousCount,
      newUniqueCount: newCount,
      newUsersAdded: newUsers.length,
      newMilestones,
      totalPointsAwarded: totalNewPoints,
      ...(newMilestones.length === 0 && {
        message: `Added ${newUsers.length} new users, no milestones reached`,
      }),
    };
  }

  /**
   * Retrieves reward summary for an image
   * @param {string} imageId - The image ID
   * @returns {Promise<Object>} - Reward summary
   */
  async getRewardSummaryForImage(imageId) {
    try {
      const reward = await this.rewardsRepository.findByImageId(imageId);

      if (!reward) {
        return {
          imageId,
          uniqueProUsersCount: 0,
          milestonesAchieved: [],
          totalPointsAwarded: 0,
        };
      }

      const image = await this.imagesRepository.getById(imageId);
      const creator = await this.usersRepository.getById(reward.user_id);

      // Determine next milestone from the active config
      const milestoneConfig = await this.milestoneConfigRepository.findActive();
      let nextMilestone = null;
      if (milestoneConfig) {
        const currentCount = reward.unique_pro_users.length;
        const next = milestoneConfig.thresholds
          .filter((t) => t.at > currentCount)
          .sort((a, b) => a.at - b.at)[0];
        nextMilestone = next ? next.at : null;
      }

      return {
        imageId: imageId,
        imageName: image?.company_name || "Unknown",
        creator: {
          id: creator?._id,
          name: creator?.name,
          email: creator?.email,
        },
        uniqueProUsersCount: reward.unique_pro_users.length,
        uniqueProUsers: reward.unique_pro_users,
        totalPointsAwarded: reward.total_points_awarded,
        milestonesAchieved: reward.milestones_achieved,
        nextMilestone,
      };
    } catch (error) {
      console.error(
        `[RewardsService] Error retrieving reward summary for image ${imageId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Retrieves user's total reward points and reward history
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - User reward data
   */
  async getUserRewardData(userId) {
    try {
      const user = await this.usersRepository.getById(userId);
      if (!user) {
        return null;
      }

      const rewards = await this.rewardsRepository.findByUserId(userId);

      const totalPointsAwarded = rewards.reduce(
        (sum, r) => sum + (r.total_points_awarded || 0),
        0
      );

      const rewardsWithImages = rewards.map((r) => {
        let imageUrl = null;
        if (r.image_id?.company_name && r.image_id?.extension) {
          const imagePath = `${r.image_id.extension}/${r.image_id.company_name}.${r.image_id.extension}`;
          const signedUrlResult = cloudFrontSignedURL(`/${imagePath}`);
          imageUrl = signedUrlResult.success ? signedUrlResult.data : null;
        }

        return {
          imageId: r.image_id?._id || r.image_id,
          imageName: r.image_id?.company_name || "Unknown",
          imageUrl,
          uniqueProUsersCount: r.unique_pro_users.length,
          totalPointsAwarded: r.total_points_awarded,
          milestonesAchieved: r.milestones_achieved.length,
        };
      });

      return {
        userId,
        userName: user.name,
        email: user.email,
        currentPoints: user.reward_points_current || 0,
        lifetimePoints: user.reward_points_lifetime || 0,
        totalImages: rewards.length,
        totalPointsAwarded: totalPointsAwarded,
        averagePointsPerImage:
          rewards.length > 0
            ? Math.round(totalPointsAwarded / rewards.length)
            : 0,
        rewards: rewardsWithImages,
      };
    } catch (error) {
      console.error(
        `[RewardsService] Error retrieving reward data for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Gets leaderboard of top creators by reward points (aggregated per user)
   * @param {number} limit - Number of top creators to return
   * @returns {Promise<Array>} - Top creators list
   */
  async getRewardsLeaderboard(limit = 10) {
    try {
      const topCreators =
        await this.rewardsRepository.getLeaderboardAggregated(limit);

      return topCreators.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        name: entry.name || "Unknown",
        email: entry.email || "Unknown",
        totalPointsAwarded: entry.totalPointsAwarded,
        milestonesAchieved: entry.milestonesAchieved,
      }));
    } catch (error) {
      console.error(
        `[RewardsService] Error retrieving rewards leaderboard:`,
        error
      );
      throw error;
    }
  }

  /**
   * Gets a user's rank in the leaderboard
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - User's rank, total points, and total users
   */
  async getUserLeaderboardRank(userId) {
    try {
      return await this.rewardsRepository.getUserRankAggregated(userId);
    } catch (error) {
      console.error(
        `[RewardsService] Error retrieving user leaderboard rank:`,
        error
      );
      throw error;
    }
  }

  /**
   * Gets transaction history for an image
   * @param {string} imageId - The image ID
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise<Object>} - Paginated transactions
   */
  async getImageTransactions(imageId, page = 1, limit = 20) {
    try {
      return await this.rewardTransactionsRepository.getTransactionsByImageId(
        imageId,
        page,
        limit
      );
    } catch (error) {
      console.error(
        `[RewardsService] Error retrieving transactions for image ${imageId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Gets transaction history for a user (creator)
   * @param {string} userId - The user ID
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise<Object>} - Paginated transactions
   */
  async getUserTransactions(userId, page = 1, limit = 20) {
    try {
      return await this.rewardTransactionsRepository.getTransactionsByUserId(
        userId,
        page,
        limit
      );
    } catch (error) {
      console.error(
        `[RewardsService] Error retrieving transactions for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Gets a specific transaction
   * @param {string} transactionId - The transaction ID
   * @returns {Promise<Object>} - Transaction details
   */
  async getTransaction(transactionId) {
    try {
      return await this.rewardTransactionsRepository.getTransactionById(
        transactionId
      );
    } catch (error) {
      console.error(
        `[RewardsService] Error retrieving transaction ${transactionId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Manually awards bonus points to a user
   * @param {string} imageId - The image ID
   * @param {string} userId - The creator's user ID
   * @param {number} points - Points to award
   * @param {string} reason - Reason for bonus
   * @param {string} description - Description
   * @returns {Promise<Object>} - Transaction details
   */
  async awardBonusPoints(imageId, userId, points, reason, description) {
    try {
      if (!imageId) {
        throw new Error("Image ID is required");
      }

      const image = await this.imagesRepository.getById(imageId);
      if (!image) {
        throw new Error("Image not found");
      }

      const user = await this.usersRepository.getById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Find or create rewards record for this image
      const reward = await this.rewardsRepository.findOrCreateByImageId(
        imageId,
        userId
      );

      // Update rewards document
      await this.rewardsRepository.update(reward._id, {
        $inc: { total_points_awarded: points },
        $set: { updated_at: new Date() },
      });

      const previousTotal = user.reward_points_current || 0;
      const newTotal = previousTotal + points;

      // Update user points
      await this.usersRepository.update(userId, {
        reward_points_current: newTotal,
        reward_points_lifetime: (user.reward_points_lifetime || 0) + points,
        updated_at: new Date(),
      });

      // Create transaction record
      const transaction =
        await this.rewardTransactionsRepository.createTransaction({
          image_id: imageId,
          user_id: userId,
          transaction_type: "BONUS",
          points_awarded: points,
          description: description || `Bonus award: ${reason}`,
          reason: reason || "PROMOTION",
          previous_total: previousTotal,
          new_total: newTotal,
          is_reversed: false,
          metadata: {
            awarded_at: new Date(),
          },
        });

      return transaction;
    } catch (error) {
      console.error(`[RewardsService] Error awarding bonus points:`, error);
      throw error;
    }
  }

  /**
   * Reverses a reward transaction
   * @param {string} transactionId - The transaction to reverse
   * @param {string} reversedBy - User ID of who is reversing
   * @param {string} reason - Reason for reversal
   * @returns {Promise<Object>} - Reversal details
   */
  async reverseTransaction(transactionId, reversedBy, reason) {
    try {
      const transaction =
        await this.rewardTransactionsRepository.getTransactionById(
          transactionId
        );

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.is_reversed) {
        throw new Error("Transaction already reversed");
      }

      // Reverse the transaction
      const reversedTransaction =
        await this.rewardTransactionsRepository.reverseTransaction(
          transactionId,
          reversedBy,
          reason
        );

      // Update user's points
      const user = await this.usersRepository.getById(transaction.user_id);
      const newPointsCurrent =
        (user.reward_points_current || 0) - transaction.points_awarded;

      await this.usersRepository.update(transaction.user_id, {
        reward_points_current: Math.max(0, newPointsCurrent),
        updated_at: new Date(),
      });

      // If reversing a BONUS transaction, also decrement the rewards document
      const imageId = transaction.image_id?._id ?? transaction.image_id;
      if (transaction.transaction_type === "BONUS" && imageId) {
        await this.rewardsRepository.updateByImageId(imageId, {
          $inc: { total_points_awarded: -transaction.points_awarded },
          $set: { updated_at: new Date() },
        });
      }

      // Create a reversal transaction record
      await this.rewardTransactionsRepository.createTransaction({
        image_id: imageId,
        user_id: transaction.user_id,
        transaction_type: "REVERSAL",
        points_awarded: 0,
        points_reversed: transaction.points_awarded,
        description: `Reversal of transaction ${transactionId}: ${reason}`,
        reason,
        previous_total: user.reward_points_current || 0,
        new_total: Math.max(0, newPointsCurrent),
        is_reversed: false,
        metadata: {
          reversed_transaction_id: transactionId,
          reversed_at: new Date(),
          reversed_by: reversedBy,
        },
      });

      return reversedTransaction;
    } catch (error) {
      const safeTransactionId = String(transactionId).replace(/[^\w-]/g, "");
      console.error(
        `[RewardsService] Error reversing transaction ${safeTransactionId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Gets transaction statistics for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - Transaction statistics
   */
  async getUserTransactionStats(userId) {
    try {
      return await this.rewardTransactionsRepository.getUserTransactionStats(
        userId
      );
    } catch (error) {
      const safeUserId = String(userId).replace(/[^\w-]/g, "");
      console.error(
        `[RewardsService] Error retrieving transaction stats for user ${safeUserId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Gets audit trail for reward history
   * @param {string} imageId - The image ID
   * @param {string} userId - The creator's user ID
   * @returns {Promise<Array>} - Audit trail
   */
  async getAuditTrail(imageId, userId) {
    try {
      return await this.rewardTransactionsRepository.getAuditTrail(
        imageId,
        userId
      );
    } catch (error) {
      console.error(`[RewardsService] Error retrieving audit trail:`, error);
      throw error;
    }
  }

  /**
   * Searches transactions with filters
   * @param {Object} filters - Search filters
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise<Object>} - Filtered results
   */
  async searchTransactions(filters, page = 1, limit = 20) {
    try {
      return await this.rewardTransactionsRepository.searchTransactions(
        filters,
        page,
        limit
      );
    } catch (error) {
      console.error(`[RewardsService] Error searching transactions:`, error);
      throw error;
    }
  }
}

module.exports = RewardsService;
