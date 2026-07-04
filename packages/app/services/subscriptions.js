const {
  SubscriptionsRepository,
  SubscriptionLogRepository,
} = require("../repositories");
const {
  DefaultSubscriptionPlan,
  ProSubscriptionPlan,
  SubscriptionTypes,
} = require("../utils/constants");

class SubscriptionService {
  constructor() {
    this.subscriptionRepository = new SubscriptionsRepository();
    this.subscriptionLogRepository = new SubscriptionLogRepository();
  }

  /**
   * Gets Subscription by Id.
   * @param {string} subscriptionId - The subscription_id of the user.
   * @returns {Promise<Object>} - Subscription Object.
   */
  async getSubscription(subscriptionId, { session } = {}) {
    return await this.subscriptionRepository.getById(subscriptionId, {
      session,
    });
  }

  /**
   * Create a new Default Subscription Plan for User.
   * @returns {Promise<Object>} - Subscription Object.
   */
  async createSubscription() {
    return await this.subscriptionRepository.create(DefaultSubscriptionPlan);
  }

  /**
   * Increments the API usage count using subscriptionID.
   * @param {string} subscriptionId - subscriptionID of subscription
   *  @returns {Promise<Object>} - The subscription details.
   **/
  async incrementUsageCount(subscription) {
    const data = {
      usage_count: subscription.usage_count + 1,
    };
    return await this.subscriptionRepository.update(subscription._id, data);
  }

  /**
   * Gets all API usage count from the database.
   * @returns {Promise<number>} - Returns a promise with total no of subscriptions.
   */
  async getSubscriptionUsageCount() {
    return await this.subscriptionRepository.getSubscriptionUsageCount();
  }

  /**
   * Changes a user's subscription plan (admin-only).
   * Preserves the existing usage_count.
   * @param {string} subscriptionId - The subscription document ID.
   * @param {string} newPlanType - "HOBBY" or "PRO".
   * @returns {Promise<Object>} - Updated subscription document.
   */
  async changeSubscriptionPlan(subscriptionId, newPlanType, { session } = {}) {
    const planTemplate =
      newPlanType === SubscriptionTypes.PRO
        ? ProSubscriptionPlan
        : DefaultSubscriptionPlan;

    const update = {
      type: planTemplate.type,
      key_limit: planTemplate.key_limit,
      usage_limit: planTemplate.usage_limit,
      is_active: planTemplate.is_active,
      updated_at: new Date(),
    };

    const options = { new: true, runValidators: true };
    if (session) {
      options.session = session;
    }

    return await this.subscriptionRepository.findOneAndUpdate(
      { _id: subscriptionId },
      { $set: update },
      options
    );
  }

  /**
   * Creates an audit log entry for a subscription plan change.
   * @param {Object} logData - { user_id, subscription_id, changed_by, from_plan, to_plan, reason? }
   * @returns {Promise<Object>} - Created log document.
   */
  async createSubscriptionLog(logData, { session } = {}) {
    if (session) {
      return await this.subscriptionLogRepository.create(logData, { session });
    }
    return await this.subscriptionLogRepository.create(logData);
  }

  /**
   * Returns a paginated list of all subscription change logs.
   * @param {number} page  - 1-based page number
   * @param {number} limit - records per page
   * @returns {Promise<{ logs: Array, total: number, totalPages: number }>}
   */
  async getSubscriptionLogs(page, limit) {
    return await this.subscriptionLogRepository.findPaginated(page, limit);
  }
}

module.exports = SubscriptionService;
