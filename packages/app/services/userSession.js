// services/userSession.js
const crypto = require("crypto");
const UAParser = require("ua-parser-js");
const UserSessionRepository = require("../repositories/userSession");

/**
 * Maximum number of concurrent active sessions allowed per user.
 * When this limit is reached, the oldest session is automatically revoked
 * before a new one is created.
 */
const MAX_SESSIONS_PER_USER = 5;

class UserSessionService {
  constructor() {
    this.userSessionRepository = new UserSessionRepository();
  }

  /**
   * Generates a cryptographically secure session ID.
   * @returns {string} 128-char hex string.
   */
  generateSessionId() {
    return crypto.randomBytes(64).toString("hex");
  }

  /**
   * Parses a User-Agent string into structured device info.
   * Falls back to "Unknown" / "desktop" for any unrecognised values.
   * @param {string} userAgent
   * @returns {{ browser: string, os: string, deviceType: string }}
   */
  parseUserAgent(userAgent) {
    const parser = new UAParser(userAgent || "");
    const result = parser.getResult();
    return {
      browser: result.browser.name || "Unknown",
      os: result.os.name || "Unknown",
      deviceType: result.device.type || "desktop",
    };
  }

  /**
   * Creates a new user session for a specific device/browser.
   * Enforces a per-user session cap (MAX_SESSIONS_PER_USER) by revoking
   * the oldest session when the limit is reached.
   * @param {Object} params
   * @param {string} params.userId      - User ID.
   * @param {string} [params.userAgent] - Raw User-Agent header value.
   * @param {string} [params.ipAddress] - Client IP address.
   * @returns {Promise<Object>} Created session document.
   */
  async createSession({ userId, userAgent = "" }) {
    // Enforce max concurrent sessions — revoke the oldest if at the limit.
    const activeSessions =
      await this.userSessionRepository.findAllActiveSessionsByUser(userId);
    if (activeSessions.length >= MAX_SESSIONS_PER_USER) {
      const oldest = activeSessions.at(-1);
      await this.userSessionRepository.deactivateSession(oldest.sessionId);
    }

    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const deviceInfo = this.parseUserAgent(userAgent);

    return await this.userSessionRepository.create({
      userId,
      sessionId,
      expiresAt,
      deviceInfo,
    });
  }

  /**
   * Validates a session using sessionId.
   * @param {string} sessionId - Session identifier.
   * @returns {Promise<Object|null>} Active session (with populated userId) or null.
   */
  async validateSession(sessionId) {
    return await this.userSessionRepository.findBySessionId(sessionId);
  }

  /**
   * @deprecated — No longer called during sign-in.
   * The per-device design always creates a new session on each sign-in.
   * Retained so existing callers don't break; will be removed in a later cleanup PR.
   * @param {string} userId
   */
  async userActiveSession(userId) {
    return await this.userSessionRepository.findActiveSessionByUser(userId);
  }

  /**
   * Deactivates a single user session (standard sign-out from current device).
   * @param {string} sessionId
   */
  async signout(sessionId) {
    return await this.userSessionRepository.deactivateSession(sessionId);
  }

  /**
   * Returns all active sessions for a user (for the "Manage Sessions" UI).
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getActiveSessions(userId) {
    return await this.userSessionRepository.findAllActiveSessionsByUser(userId);
  }

  /**
   * Revokes a specific session, scoped to the authenticated user.
   * @param {string} userId
   * @param {string} targetSessionId
   * @returns {Promise<Object|null>} Deactivated session or null if not found.
   */
  async revokeSession(userId, targetSessionId) {
    return await this.userSessionRepository.deactivateSessionByUser(
      userId,
      targetSessionId
    );
  }

  /**
   * Revokes all sessions except the current one ("sign out from all other devices").
   * @param {string} userId
   * @param {string} currentSessionId
   * @returns {Promise<Object>} Mongoose updateMany result.
   */
  async revokeOtherSessions(userId, currentSessionId) {
    return await this.userSessionRepository.deactivateOtherSessions(
      userId,
      currentSessionId
    );
  }

  /**
   * Revokes all sessions for a user, including the current one.
   * @param {string} userId
   * @returns {Promise<Object>} Mongoose updateMany result.
   */
  async signoutAll(userId) {
    return await this.userSessionRepository.deactivateAllUserSessions(userId);
  }

  /**
   * Updates the lastActiveAt timestamp for a session.
   * Called (throttled) by the auth middleware — at most once every 5 minutes
   * — to track session freshness without hammering the DB on every request.
   * @param {string} sessionId
   */
  async touchSession(sessionId) {
    return await this.userSessionRepository.updateLastActive(sessionId);
  }
}

module.exports = UserSessionService;
