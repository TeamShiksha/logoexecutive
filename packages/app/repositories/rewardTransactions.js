const BaseRepository = require("./base");
const RewardTransactions = require("../models/rewardTransactions");

class RewardTransactionsRepository extends BaseRepository {
  constructor() {
    super(RewardTransactions);
  }

  /**
   * Create a new reward transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} - Created transaction record
   */
  async createTransaction(transactionData, { session } = {}) {
    return await this.create(transactionData, { session });
  }

  /**
   * Get all transactions for a user's images (creator)
   * @param {string} userId - The creator's user ID
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise<Object>} - Paginated transactions
   */
  async getTransactionsByUserId(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const total = await this.model.countDocuments({ user_id: userId });
    const data = await this.model
      .find({ user_id: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("image_id", "company_name")
      .populate("user_id", "name email")
      .populate("reversed_by", "name email");

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all transactions for a specific image
   * @param {string} imageId - The image ID
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise<Object>} - Paginated transactions
   */
  async getTransactionsByImageId(imageId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const total = await this.model.countDocuments({ image_id: imageId });
    const data = await this.model
      .find({ image_id: imageId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user_id", "name email")
      .populate("reversed_by", "name email");

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get transaction by ID
   * @param {string} transactionId - The transaction ID
   * @returns {Promise<Object|null>} - Transaction or null
   */
  async getTransactionById(transactionId) {
    return await this.model
      .findById(transactionId)
      .populate("image_id", "company_name")
      .populate("user_id", "name email")
      .populate("reversed_by", "name email");
  }

  /**
   * Reverse a transaction
   * @param {string} transactionId - The transaction to reverse
   * @param {string} reversedBy - User ID of who is reversing
   * @param {string} reason - Reason for reversal
   * @returns {Promise<Object>} - Updated transaction
   */
  async reverseTransaction(transactionId, reversedBy, reason) {
    return await this.model.findByIdAndUpdate(
      transactionId,
      {
        is_reversed: true,
        reversed_at: new Date(),
        reversed_by: reversedBy,
        reversal_reason: reason,
        updated_at: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Get transaction statistics for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - Statistics
   */
  async getUserTransactionStats(userId) {
    const pipeline = [
      { $match: { user_id: userId, is_reversed: false } },
      {
        $group: {
          _id: "$transaction_type",
          count: { $sum: 1 },
          total_points: { $sum: "$points_awarded" },
        },
      },
      {
        $group: {
          _id: null,
          transaction_types: {
            $push: {
              type: "$_id",
              count: "$count",
              total_points: "$total_points",
            },
          },
          total_transactions: { $sum: "$count" },
          total_points_awarded: { $sum: "$total_points" },
        },
      },
    ];

    const result = await this.model.aggregate(pipeline);
    return result.length > 0
      ? result[0]
      : {
          transaction_types: [],
          total_transactions: 0,
          total_points_awarded: 0,
        };
  }

  /**
   * Get transaction history for audit
   * @param {string} imageId - The image ID
   * @param {string} userId - The creator's user ID
   * @returns {Promise<Array>} - Sorted transactions
   */
  async getAuditTrail(imageId, userId) {
    return await this.model
      .find({ image_id: imageId, user_id: userId })
      .sort({ createdAt: 1 })
      .populate("reversed_by", "name email");
  }

  /**
   * Search transactions with filters
   * @param {Object} filters - Search filters
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {Promise<Object>} - Filtered results
   */
  async searchTransactions(filters, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = {};

    if (filters.userId) query.user_id = filters.userId;
    if (filters.imageId) query.image_id = filters.imageId;
    if (filters.transactionType)
      query.transaction_type = filters.transactionType;
    if (filters.isReversed !== undefined)
      query.is_reversed = filters.isReversed;
    if (filters.reason) query.reason = filters.reason;

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const total = await this.model.countDocuments(query);
    const data = await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("image_id", "company_name")
      .populate("user_id", "name email")
      .populate("reversed_by", "name email");

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = RewardTransactionsRepository;
