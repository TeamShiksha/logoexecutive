const BaseRepository = require("./base");
const SubscriptionLog = require("../models/subscriptionLog");

class SubscriptionLogRepository extends BaseRepository {
  constructor() {
    super(SubscriptionLog);
  }

  /**
   * Fetches a paginated list of subscription logs, newest first,
   * with user and admin names populated.
   * @param {number} page  - 1-based page number
   * @param {number} limit - records per page
   * @returns {Promise<{ logs: Array, total: number, totalPages: number }>}
   */
  async findPaginated(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.model
        .find({})
        .populate("user_id", "name email")
        .populate("changed_by", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v"),
      this.model.countDocuments({}),
    ]);
    return { logs, total, totalPages: Math.ceil(total / limit) };
  }
}

module.exports = SubscriptionLogRepository;
