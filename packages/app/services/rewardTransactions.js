const {
  LogoRequestLogsRepository,
  SubscriptionsRepository,
  UsersRepository,
  ImagesRepository,
} = require("../repositories");
const { SubscriptionTypes } = require("../utils/constants");

class RewardTrackingService {
  constructor() {
    this.logoRequestLogsRepository = new LogoRequestLogsRepository();
    this.subscriptionsRepository = new SubscriptionsRepository();
    this.usersRepository = new UsersRepository();
    this.imagesRepository = new ImagesRepository();
  }

  /**
   * Validates and logs a logo request for potential reward eligibility
   * Performs plan validation, self-usage check, and duplicate usage check
   * @param {Object} params - Request parameters
   * @param {string} params.imageId - The image ID
   * @param {string} params.userId - The requester's user ID
   * @param {string} params.creatorId - The logo creator's user ID
   * @param {string} params.keyId - The API key ID
   * @param {Object} params.subscription - The subscription object
   * @param {number} [params.response_size_bytes=0] - The size of the response in bytes
   * @returns {Promise<Object>} - Log entry with eligibility details
   */
  async validateAndLogRequest({
    imageId,
    userId,
    creatorId,
    keyId,
    subscription,
    response_size_bytes,
  }) {
    const logEntry = {
      user_id: userId,
      key_id: keyId,
      image_id: imageId,
      response_size_bytes: response_size_bytes || 0,
      user_plan: subscription.type,
      is_reward_eligible: false,
      reward_eligibility_reason: null,
    };

    // Check 1: User plan validation
    if (subscription.type !== SubscriptionTypes.PRO) {
      logEntry.is_reward_eligible = false;
      logEntry.reward_eligibility_reason = "HOBBY_USER";
      return await this.logoRequestLogsRepository.create(logEntry);
    }

    // Check 2: Self-usage check
    if (userId.toString() === creatorId.toString()) {
      logEntry.is_reward_eligible = false;
      logEntry.reward_eligibility_reason = "SELF_USAGE";
      return await this.logoRequestLogsRepository.create(logEntry);
    }

    // Check 3: Duplicate usage check
    const existingUsage = await this.logoRequestLogsRepository.find({
      image_id: imageId,
      user_id: userId,
      is_reward_eligible: true,
    });

    if (existingUsage && existingUsage.length > 0) {
      logEntry.is_reward_eligible = false;
      logEntry.reward_eligibility_reason = "DUPLICATE_USAGE";
      return await this.logoRequestLogsRepository.create(logEntry);
    }

    // All checks passed
    logEntry.is_reward_eligible = true;
    logEntry.reward_eligibility_reason = "VALID";
    const createdLog = await this.logoRequestLogsRepository.create(logEntry);

    // Trigger async reward processing
    this.triggerAsyncRewardProcessing(imageId);

    return createdLog;
  }

  /**
   * Flags the image for the next scheduled reward worker run.
   * Replaces the old inline async job trigger — reward calculation is now
   * fully decoupled and handled by the GitHub Actions worker.
   * @param {string} imageId - The image ID to flag
   */
  async triggerAsyncRewardProcessing(imageId) {
    await this.imagesRepository.update(imageId, { has_pending_reward: true });
  }

  /**
   * Validates request parameters
   * @param {Object} params - Parameters to validate
   * @returns {Object} - Validation result { isValid, errors }
   */
  validateRequestParams(params) {
    const errors = [];

    if (!params.imageId) errors.push("imageId is required");
    if (!params.userId) errors.push("userId is required");
    if (!params.creatorId) errors.push("creatorId is required");
    if (!params.subscriptionId) errors.push("subscriptionId is required");
    if (!params.subscription) errors.push("subscription object is required");

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = RewardTrackingService;
