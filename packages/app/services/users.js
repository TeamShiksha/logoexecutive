const bcrypt = require("bcryptjs");
const KeyService = require("../services/keys");
const SubscriptionService = require("../services/subscriptions");
const { UsersRepository, RequestRepository } = require("../repositories");
const { UserType } = require("../utils/constants");
const ImageService = require("../services/images");
const RewardTransactionsService = require("../services/rewardTransactions");

class UserService {
  constructor() {
    this.userRepository = new UsersRepository();
    this.keyService = new KeyService();
    this.imageService = new ImageService();
    this.subscriptionService = new SubscriptionService();
    this.requestRepository = new RequestRepository();
    this.rewardTransactionsService = new RewardTransactionsService();
  }

  /**
   * Gets User by Id.
   * @param {string} userId - The userId of the user.
   * @param {Object} session - mongoose session
   * @returns {Promise<Object>} - User Object.
   */
  async getUser(userId, { session } = {}) {
    return await this.userRepository.getById(userId, { session });
  }

  /**
   * Compiles all data for a user download.
   * @param {string} userId - The user's ID.
   * @returns {Object|null} - The compiled data object or null if user not found.
   */
  async getUserDataForDownload(userId) {
    const userData = await this.getUser(userId);

    if (!userData) {
      return null;
    }

    const [userRequests, apiKeys, subscription] = await Promise.all([
      this.requestRepository.find({ user_id: userId }),
      this.keyService.getAllUserKeys(userData.keys),
      this.subscriptionService.getSubscription(userData.subscription_id),
    ]);

    const dataToDownload = {
      profile: {
        userId: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        accountCreatedAt: userData._id.getTimestamp(),
      },
      generationHistory: {
        totalGenerations: userRequests.length,
        generations: userRequests.map((req) => ({
          requestId: req._id,
          companyUrl: req.companyUrl,
          status: req.status,
          requestedAt: req.openedAt,
        })),
      },
      usageStats: {
        apiCalls: subscription?.usage_count || 0,
        apiCallsLimit: subscription?.usage_limit || 0,
      },
      security: {
        totalApiKeys: apiKeys.length,
        apiKeys: apiKeys.map((key) => ({
          usageCount: key.usageCount,
          keyId: key._id,
          description: key.key_description,
          createdAt: key._id.getTimestamp(),
        })),
      },
    };

    return dataToDownload;
  }

  /**
   * Fetch all users from the database.
   * @returns {Promise<number>} - Returns a promise with total no of users.
   */
  async getUsersCount() {
    return await this.userRepository.getUsersCount();
  }

  /**
   * Update User by userId.
   * @param {string, string} {firstName, lastName} - First and Last Name of the User.
   * @param {String} userId - The userId of the user.
   * @returns {boolean} - True if User Details are updated successfully else false.
   */
  async updateUser(updatedName, userId) {
    const updatedData = {
      name: updatedName,
    };
    const updatedUser = await this.userRepository.update(userId, updatedData);
    if (updatedUser == null) {
      return false;
    }
    return true;
  }

  /**
   * Creates a new user key and updates the user's key list.
   *
   * @param {Object} newKey - The new key details to be created.
   * @param {Object} user - The user object to which the new key should be associated.
   * @returns {Object|null} - Returns the created key object on success, or null if creation failed.
   * @throws {Error} - Throws an error if the key creation or user update fails.
   */
  async createNewUserKey(newKey, user) {
    const { key_description, subscription_id, expires_at } = newKey;
    const keyValidity = expires_at;
    const today = new Date();
    const keyExpiry = today.setDate(today.getDate() + keyValidity);
    const newUserKey = await this.keyService.createNewKey({
      key_description: key_description,
      subscription_id: subscription_id,
      expires_at: keyExpiry,
    });
    user.keys.push(newUserKey._id);
    await user.save();
    return newUserKey;
  }

  /**
   * Updates the user's password and saves the changes to the database.
   * @param {Object} user - The user object whose password is to be updated.
   * @param {string} newPassword - The new hashed password to replace the existing one.
   * @returns {boolean} - Returns `true` if the password was successfully updated, otherwise `false`.
   */
  async updateUserPassword(user, newPassword) {
    user.password = await bcrypt.hash(newPassword, 10);
    user.updated_at = Date.now();
    const updatedUser = await user.save();
    return updatedUser ? true : false;
  }

  /**
   * Destroy a User Key.
   * @param {string} keyId - The Key Id to destroy.
   * @param {string} user - The user Object.
   * @returns {boolean} - true if key was successfully destroyed.
   */
  async destroyUserKey(keyId, user) {
    const destroyedKey = await this.keyService.destroyKey(keyId);
    if (destroyedKey) {
      user.keys.pull(destroyedKey._id);
      await user.save();
    }
    return destroyedKey;
  }

  /*
   * Marks `is_deleted` attribute of the user to true and adds deleted_at timestamp.
   * @param {string} userId - The user id to soft delete.
   * @returns {boolean} - true if user was successfully soft deleted.
   */
  async markDeleteUser(userId) {
    const deletedUser = await this.userRepository.update(userId, {
      is_deleted: true,
      deleted_at: new Date(),
    });
    return !!deletedUser;
  }
  /*
   * Delete a User Account.
   * @param {string} userId - The user id to delete.
   * @returns {boolean} - true if user was successfully deleted.
   */
  async deleteUserAccount(userId) {
    const deletedUser = await this.userRepository.delete(userId);
    return !!deletedUser;
  }

  /**
   * Finds a user by their email address.
   * @param {string} email - The email address to search for.
   * @returns {Promise<Object>} - The user document if found, otherwise null.
   */
  async getUserByEmail(email) {
    return await this.userRepository.findUserByEmail(email);
  }

  async getGuestUser() {
    return await this.userRepository.getGuestUser();
  }

  /**
   * Assign a role to the user.
   * @param {string} email - The email of the user.
   * @return {string} - The role of the user.
   */
  getRole(email) {
    const role = process.env.ADMINSEMAILS.split(",").includes(email)
      ? UserType.ADMIN
      : UserType.CUSTOMER;
    return role;
  }

  /**
   * Create a New User.
   * @param {Object} userDetails - User Information.
   * @returns {Promise<Object>} - The user document if found, otherwise null.
   */
  async createUser(userDetails) {
    const userRole = this.getRole(userDetails.email);

    return await this.userRepository.create({
      name: userDetails.name,
      password: await bcrypt.hash(userDetails.password, 10),
      email: userDetails.email,
      is_verified: false,
      role: userRole,
      subscription_id: userDetails.subscription_id,
      is_deleted: false,
    });
  }

  /**
   * Verifies the given user.
   * @param {Object} userId - The userId of the user.
   * @returns {Promise<Object>} - The verification result.
   */
  async verifyUser(userId) {
    const verifyUserData = {
      is_verified: true,
    };
    const userVerifed = await this.userRepository.update(
      userId,
      verifyUserData
    );
    if (userVerifed == null) {
      return false;
    }
    return true;
  }

  /**
   * Updates the user's role to Admin
   * @param {string} email - The email address of the user to be updated.
   * @returns {Promise<boolean>} - Returns `true` if the user's role was successfully updated to Admin, otherwise `false`.
   */
  async updateUserToAdmin(email) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return false;
    }
    const updatedData = {
      role: UserType.ADMIN,
    };
    const updatedUser = await this.userRepository.update(user._id, updatedData);
    if (!updatedUser || updatedUser.role != UserType.ADMIN) {
      return false;
    }
    return true;
  }

  /**
   * Atomically updates forgot password attempts with race condition protection.
   * Returns null if the update fails due to rate limiting or cooldown.
   *
   * @param {Object} user - The user object
   * @param {boolean} reset - Whether to reset the counter (after 24 hours)
   * @returns {Promise<Object|null>} - Updated user or null if rate limited
   */
  async updateUserFortgotPasswordAttempts(user, reset = false) {
    const MAX_ATTEMPTS_PER_DAY = 2;
    const RESET_WINDOW_HOURS = 24;
    const COOLDOWN_MS = 2 * 60 * 1000;
    const now = new Date();
    const resetWindowDate = new Date(
      now.getTime() - RESET_WINDOW_HOURS * 60 * 60 * 1000
    );
    const cooldownDate = new Date(now.getTime() - COOLDOWN_MS);

    if (reset) {
      return await this.userRepository.findOneAndUpdate(
        {
          _id: user._id,
          $or: [
            { forgot_password_last_reset_at: { $lt: resetWindowDate } },
            { forgot_password_last_reset_at: { $exists: false } },
            { forgot_password_last_reset_at: null },
          ],
        },
        {
          $set: {
            forgot_password_attempts: 1,
            forgot_password_last_reset_at: now,
          },
        },
        { new: true }
      );
    }

    return await this.userRepository.findOneAndUpdate(
      {
        _id: user._id,
        $and: [
          {
            $or: [
              { forgot_password_attempts: { $lt: MAX_ATTEMPTS_PER_DAY } },
              { forgot_password_attempts: { $exists: false } },
              { forgot_password_attempts: null },
            ],
          },
          {
            $or: [
              { forgot_password_last_reset_at: { $lt: cooldownDate } },
              { forgot_password_last_reset_at: { $exists: false } },
              { forgot_password_last_reset_at: null },
            ],
          },
        ],
      },
      {
        $set: {
          forgot_password_last_reset_at: now,
        },
        $inc: { forgot_password_attempts: 1 },
      },
      { new: true }
    );
  }

  /**
   * Gets userId from subscriptionId.
   * @param {String} subscriptionId - The subscriptionId of the user.
   * @returns {Object} - User Object.
   */
  async getUserBySubscriptionId(subscriptionId) {
    return await this.userRepository.findUserBySubscriptionId(subscriptionId);
  }

  /**
   * Lists CUSTOMER users with their subscription details.
   * Supports search by name/email, pagination, and optionally includes deleted users.
   * @param {Object} options
   * @param {string} [options.search]
   * @param {number} options.page
   * @param {number} options.limit
   * @param {boolean} options.includeDeleted
   * @returns {Promise<{ users: Array, total: number }>}
   */
  async listUsers({ search, page, limit, includeDeleted }) {
    return await this.userRepository.findUsersWithSubscription({
      search,
      page,
      limit,
      includeDeleted,
    });
  }

  /**
   * Logs an API request entry for a logo fetch operation and validates for reward eligibility.
   * This is a non-fatal operation - failures are logged but do not interrupt the flow.
   * @param {string} company - The company name.
   * @param {Object} userSubscription - The user's subscription object.
   * @param {Object} keyRef - The API key reference object.
   * @returns {Promise<void>} - No return value, failures are silently logged.
   */
  async logLogoRequestEntry(company, userSubscription, keyRef) {
    try {
      const [imageDoc, userRef] = await Promise.all([
        this.imageService.getImageByCompanyName(company),
        this.getUserBySubscriptionId(userSubscription._id),
      ]);
      // Reward tracking: validate and log request for reward eligibility
      if (imageDoc) {
        this.rewardTransactionsService
          .validateAndLogRequest({
            imageId: imageDoc._id,
            userId: userRef._id,
            creatorId: imageDoc.user_id,
            keyId: keyRef._id,
            subscriptionId: keyRef.subscription_id,
            subscription: userSubscription,
            response_size_bytes: imageDoc?.image_size,
          })
          .catch((err) => {
            console.error(
              "Failed to validate and log reward request:",
              err.message
            );
          });
      }
    } catch (err) {
      console.error("Failed to create API request entry:", err.message);
    }
  }
}

module.exports = UserService;
