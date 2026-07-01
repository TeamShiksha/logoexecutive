const BaseRepository = require("./base");
const Rewards = require("../models/rewards");

class RewardsRepository extends BaseRepository {
  constructor() {
    super(Rewards);
  }

  /**
   * Find or create a reward record for an image
   * @param {string} imageId - The image ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - The reward record
   */
  async findOrCreateByImageId(imageId, userId, { session } = {}) {
    let reward;
    if (session) {
      reward = await this.model.findOne({ image_id: imageId }).session(session);
    } else {
      reward = await this.model.findOne({ image_id: imageId });
    }
    if (!reward) {
      reward = await this.create(
        { image_id: imageId, user_id: userId, unique_pro_users: [] },
        { session }
      );
    }
    return reward;
  }

  /**
   * Get reward by image ID
   * @param {string} imageId - The image ID
   * @returns {Promise<Object|null>} - The reward record or null
   */
  async findByImageId(imageId) {
    return await this.model.findOne({ image_id: imageId });
  }

  /**
   * Get all rewards for a user's images
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of reward records
   */
  async findByUserId(userId) {
    return await this.model
      .find({ user_id: userId })
      .populate("image_id", "company_name extension");
  }

  /**
   * Update rewards record by image ID
   * @param {string} imageId - The image ID
   * @param {Object} updateData - The update operations (e.g. $inc)
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object>} - Updated reward record
   */
  async updateByImageId(imageId, updateData, options = {}) {
    return await this.model.findOneAndUpdate(
      { image_id: imageId },
      updateData,
      { ...options, new: true }
    );
  }

  /**
   * Get aggregated leaderboard ranked by total points per user
   * @param {number} limit - Number of top users to return
   * @returns {Promise<Array>} - Aggregated leaderboard entries
   */
  async getLeaderboardAggregated(limit = 10) {
    return await this.model.aggregate([
      {
        $group: {
          _id: "$user_id",
          totalPointsAwarded: { $sum: "$total_points_awarded" },
          milestonesAchieved: { $sum: { $size: "$milestones_achieved" } },
        },
      },
      { $sort: { totalPointsAwarded: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          totalPointsAwarded: 1,
          milestonesAchieved: 1,
        },
      },
    ]);
  }

  /**
   * Get a specific user's rank in the aggregated leaderboard
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - User's rank, total points, and total users
   */
  async getUserRankAggregated(userId) {
    const allUsers = await this.model.aggregate([
      {
        $group: {
          _id: "$user_id",
          totalPointsAwarded: { $sum: "$total_points_awarded" },
        },
      },
      { $sort: { totalPointsAwarded: -1 } },
    ]);

    const userIndex = allUsers.findIndex(
      (u) => u._id.toString() === userId.toString()
    );

    return {
      rank: userIndex === -1 ? null : userIndex + 1,
      totalPoints:
        userIndex === -1 ? 0 : allUsers[userIndex].totalPointsAwarded,
      totalUsers: allUsers.length,
    };
  }
}

module.exports = RewardsRepository;
