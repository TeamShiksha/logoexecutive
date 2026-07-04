const crypto = require("node:crypto");
const VerificationSessionRepository = require("../repositories/verificationSession");
const { UsersRepository } = require("../repositories");
const { TEMPORARY_SESSION_TYPES } = require("../utils/constants");
const { encrypt, decrypt } = require("../utils/crypto");
const QRCode = require("qrcode");
const { authenticator } = require("otplib");

class MfaService {
  constructor() {
    this.verificationSessionRepository = new VerificationSessionRepository();
    this.TEMPORARY_SESSION_TYPES = TEMPORARY_SESSION_TYPES;
    this.userRepository = new UsersRepository();
  }
  /**
   * Generates a cryptographically secure session ID.
   * @returns {string} - Random session identifier.
   */
  generateSessionId() {
    return crypto.randomBytes(64).toString("hex");
  }
  /**
   * Creates a new user session.
   * @param {Object} params
   * @param {string} params.userId - User ID.
   * @param {string} [params.verificationToken] - Verification Token
   * @returns {Promise<Object>} - Created session object.
   */
  async createSession({ userId }) {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    return await this.verificationSessionRepository.create({
      userId,
      sessionId,
      sessionType: this.TEMPORARY_SESSION_TYPES.MFA,
      expiresAt,
    });
  }

  async findAndUpdateActiveSession(sessionId) {
    return await this.verificationSessionRepository.findAndUpdateActiveSession({
      sessionType: this.TEMPORARY_SESSION_TYPES.MFA,
      sessionId,
    });
  }

  /**
   * Generates a temporary MFA secret and QR code for setup.
   * Stores the temporary secret with an expiration timestamp
   * and returns the QR code for authenticator configuration.
   * @param {Object} user - The user entity.
   * @returns {Promise<{ qrCode: string } | null>} - QR code data URL or null on failure.
   */
  async enableMfa(user) {
    const secret = authenticator.generateSecret();
    const otpauthurl = authenticator.keyuri(user.email, "OpenLogo", secret);

    const qrCode = await QRCode.toDataURL(otpauthurl);

    const updatedUser = await this.userRepository.update(user._id, {
      mfaTempSecret: secret,
      mfaTempSecretExpiresAt: Date.now() + 5 * 60 * 1000,
    });
    if (!updatedUser) return null;
    return { qrCode };
  }

  /**
   * Verifies a TOTP token against the user's temporary MFA secret.
   * Used during MFA setup confirmation before activation.
   * @param {Object} user - The user entity containing the temp secret.
   * @param {string} token - The TOTP token provided by the user.
   * @returns {Promise<boolean>} - True if valid, otherwise false.
   */
  verifyMfa(user, token) {
    const isVerified = authenticator.verify({
      secret: user.mfaTempSecret,
      token,
    });
    return isVerified;
  }

  /**
   * Activates MFA for the user.
   * Encrypts the temporary secret, persists it as the active secret,
   * enables MFA, and clears temporary setup fields.
   * @param {Object} user - The user entity.
   * @returns {Promise<boolean>} - True on success, otherwise false.
   */
  async updateMfaUser(user) {
    try {
      const { encrypted, iv, tag } = encrypt(user.mfaTempSecret);

      const updatedUser = await this.userRepository.update(user._id, {
        mfaEnabled: true,
        mfaSecret: {
          encryptedValue: encrypted,
          encryptedIv: iv,
          encryptedTag: tag,
        },
        mfaTempSecret: null,
        mfaTempSecretExpiresAt: null,
      });
      return !!updatedUser;
    } catch (error) {
      console.log("Error in updateMfaUser:", error);
      return false;
    }
  }

  /**
   * Disables MFA for the user.
   * Clears all MFA-related fields including active and temporary secrets.
   * @param {Object} user - The user entity.
   * @returns {Promise<boolean>} - True on success, otherwise false.
   */
  async disableMfa(user) {
    const updatedUser = await this.userRepository.update(user._id, {
      mfaEnabled: false,
      mfaSecret: null,
      mfaTempSecret: null,
      mfaTempSecretExpiresAt: null,
    });

    return !!updatedUser;
  }

  /**
   * Verifies a TOTP token during MFA login.
   * Decrypts the stored MFA secret and validates the provided token.
   * @param {Object} user - The user entity containing the encrypted MFA secret.
   * @param {string} token - The TOTP token provided by the user.
   * @returns {Promise<boolean>} - True if verification succeeds, otherwise false.
   */
  mfaLogin(user, token) {
    try {
      const { encryptedValue, encryptedIv, encryptedTag } = user.mfaSecret;
      const decryptedSecret = decrypt(
        encryptedValue,
        encryptedIv,
        encryptedTag
      );
      const isVerified = authenticator.verify({
        token,
        secret: decryptedSecret,
      });
      return isVerified;
    } catch (error) {
      console.log("Error in mfaLogin:", error);
      return false;
    }
  }

  getMfaStatus(user) {
    return user.mfaEnabled;
  }
}

module.exports = MfaService;
