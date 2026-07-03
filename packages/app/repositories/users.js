const BaseRepository = require("./base");
const User = require("../models/users");

/**
 * The UsersRepository extends BaseRepository to manage User model operations, inheriting CRUD methods like getById, getAll, create, update, and delete..
 * It passes the Users model to the base repository for database interactions.
 * Custom methods specific to Users can also be added as needed.
 */

class UsersRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Finds a user by email.
   * @param {string} emailId - The email address to search for.
   * @returns {Promise<Object|null>} - Returns the user document if found, otherwise null.
   */
  async findUserByEmail(email) {
    return await this.model.findOne({ email });
  }

  /**
   *
   * @returns {Promise<number>} - Total number of users.
   */
  async getUsersCount() {
    return await User.countDocuments({
      is_verified: true,
      is_deleted: false,
    });
  }
  /**
   *
   * @returns {Promise<Object|null>} - Returns the user document with role:GUEST if found, otherwise null.
   */
  async getGuestUser() {
    return await this.model.findOne({ role: "GUEST" });
  }

  /**
   * This return userId by subscriptionId
   * @param {string} subscriptionId - The subscription ID to search for.
   * @returns {Promise<Object|null>} - Returns the user document with only _id field if found, otherwise null.
   */
  async findUserBySubscriptionId(subscriptionId) {
    return await this.model
      .findOne({ subscription_id: subscriptionId })
      .select("_id")
      .lean();
  }

  /**
   * Aggregation pipeline to list CUSTOMER users with their subscription details.
   * Supports search by name/email, pagination, and optionally includes deleted users.
   * @param {Object} options
   * @param {string} [options.search] - Optional search term matched against name and email.
   * @param {number} options.page - 1-based page number.
   * @param {number} options.limit - Number of results per page.
   * @param {boolean} options.includeDeleted - Whether to include soft-deleted users.
   * @returns {Promise<{ users: Array, total: number }>}
   */
  async findUsersWithSubscription({ search, page, limit, includeDeleted }) {
    const matchStage = {
      role: "CUSTOMER",
    };

    if (!includeDeleted) {
      matchStage.is_deleted = false;
    }

    if (search) {
      const escapedSearch = search.replaceAll(
        /[.*+?^${}()|[\\\]\\]/g,
        String.raw`\$&`
      );
      const regex = new RegExp(escapedSearch, "i");
      matchStage.$or = [{ name: regex }, { email: regex }];
    }

    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "subscriptions",
          localField: "subscription_id",
          foreignField: "_id",
          as: "subscription",
        },
      },
      {
        $unwind: {
          path: "$subscription",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          is_verified: 1,
          is_deleted: 1,
          created_at: { $toDate: "$_id" },
          subscription: {
            type: "$subscription.type",
            is_active: "$subscription.is_active",
            usage_count: "$subscription.usage_count",
            usage_limit: "$subscription.usage_limit",
          },
        },
      },
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const [result] = await this.model.aggregate(pipeline);
    const users = result?.data || [];
    const total = result?.totalCount?.[0]?.count || 0;
    return { users, total };
  }
}

module.exports = UsersRepository;
