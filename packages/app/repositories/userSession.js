// repositories/userSession.js
const BaseRepository = require("./base");
const UserSession = require("../models/userSession");
const { USER_SAFE_FIELDS } = require("../utils/constants");

/**
 * UserSessionRepository handles database operations for the UserSession model.
 * It extends BaseRepository to reuse common CRUD methods.
 *
 * This repository includes session-specific methods such as:
 *  - Finding an active session by sessionId
 *  - Finding all active sessions for a user (per-device listing)
 *  - Deactivating individual or bulk sessions
 *  - Updating the lastActiveAt timestamp
 */

class UserSessionRepository extends BaseRepository {
  constructor() {
    super(UserSession);
  }

  /**
   * Find active session by sessionId
   * @param {string} sessionId
   */
  async findBySessionId(sessionId) {
    return await this.model
      .findOne({
        sessionId: String(sessionId),
        isActive: true,
        expiresAt: { $gt: new Date() },
      })
      .populate("userId", USER_SAFE_FIELDS);
  }

  /**
   * Deactivate session by sessionId
   * @param {string} sessionId
   */
  async deactivateSession(sessionId) {
    return await this.model.findOneAndUpdate(
      { sessionId: String(sessionId), isActive: true },
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Deactivate all sessions by userId
   * @param {string} userId
   */
  async deactivateAllUserSessions(userId) {
    return await this.model.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );
  }

  /**
   * @param {string} userId
   */
  async findActiveSessionByUser(userId) {
    return await this.model.findOne({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
  }

  /**
   * Find all active, non-expired sessions for a user.
   * Returns only the fields needed for the "Manage Sessions" UI,
   * sorted by most recently active first.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async findAllActiveSessionsByUser(userId) {
    return await this.model
      .find({ userId, isActive: true, expiresAt: { $gt: new Date() } })
      .select("sessionId deviceInfo createdAt lastActiveAt")
      .sort({ lastActiveAt: -1 });
  }

  /**
   * Deactivate a specific session, scoped to the owning user.
   * Scoping by userId prevents one user from revoking another user's session.
   * @param {string} userId
   * @param {string} sessionId
   * @returns {Promise<Object|null>} Updated document, or null if not found/unauthorized
   */
  async deactivateSessionByUser(userId, sessionId) {
    return await this.model.findOneAndUpdate(
      { userId, sessionId: String(sessionId), isActive: true },
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Deactivate all active sessions for a user EXCEPT the current one.
   * Used by the "Sign out from all other devices" flow.
   * @param {string} userId
   * @param {string} currentSessionId - The session to preserve
   * @returns {Promise<Object>} Mongoose updateMany result (with modifiedCount)
   */
  async deactivateOtherSessions(userId, currentSessionId) {
    return await this.model.updateMany(
      { userId, isActive: true, sessionId: { $ne: currentSessionId } },
      { isActive: false }
    );
  }

  /**
   * Update the lastActiveAt timestamp for a session.
   * Called (throttled) by the auth middleware to track session freshness.
   * @param {string} sessionId
   */
  async updateLastActive(sessionId) {
    return await this.model.findOneAndUpdate(
      { sessionId: String(sessionId), isActive: true },
      { lastActiveAt: new Date() }
    );
  }
}

module.exports = UserSessionRepository;
