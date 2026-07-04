const BaseRepository = require("./base");
const Subscriptions = require("../models/subscriptions");

/**
 * The SubscriptionsRepository extends BaseRepository to manage ContactUs model operations, inheriting CRUD methods like getById, getAll, create, update, and delete..
 * It passes the Subscriptions model to the base repository for database interactions.
 *  Custom methods specific to Subscriptions can also be added as needed.
 */

class SubscriptionsRepository extends BaseRepository {
  constructor() {
    super(Subscriptions);
  }
  /**
   * Get all API usage counts from db.
   * @returns {Promise<number>} - total number of subscriptions.
   */
  async getSubscriptionUsageCount() {
    const result = await Subscriptions.aggregate([
      {
        $match: { is_active: true },
      },
      {
        $group: {
          _id: null,
          totalUsage: { $sum: "$usage_count" },
        },
      },
    ]);
    return result.length > 0 ? result[0].totalUsage : 0;
  }

  /**
   * Conditionally updates a subscription:
   * - If start_date or end_date is missing (old users), initialize them without resetting usage_count.
   * - If the subscription has expired (end_date < now), renew the period and reset usage_count to 0.
   * - If the subscription is still valid, no changes are made.
   * @param {number} subscriptionId
   */
  async resetLimitAndExpiryDate(subscriptionId) {
    await this.model.updateOne({ _id: subscriptionId }, [
      {
        $set: {
          start_date: {
            $cond: [{ $not: ["$start_date"] }, "$$NOW", "$start_date"],
          },
          end_date: {
            $cond: [
              { $not: ["$end_date"] },
              { $dateAdd: { startDate: "$$NOW", unit: "month", amount: 1 } },
              {
                $cond: [
                  { $lt: ["$end_date", "$$NOW"] },
                  {
                    $dateAdd: { startDate: "$$NOW", unit: "month", amount: 1 },
                  },
                  "$end_date",
                ],
              },
            ],
          },
          usage_count: {
            $cond: [{ $lt: ["$end_date", "$$NOW"] }, 0, "$usage_count"],
          },
        },
      },
    ]);
  }

  /**
   * Increament the usage count
   * @param {number} subscriptionId
   */
  async incrementUsageCount(subscriptionId, usage_limit) {
    return await this.update(
      {
        _id: subscriptionId,
        usage_count: { $lt: usage_limit }, // Ensure usage_count is less than usage_limit before incrementing
      },
      { $inc: { usage_count: 1 } },
      { new: true }
    );
  }
}

module.exports = SubscriptionsRepository;
