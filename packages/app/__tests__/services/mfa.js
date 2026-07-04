jest.mock("otplib", () => ({
  authenticator: {
    generateSecret: jest.fn().mockReturnValue("MOCK_SECRET"),
    keyuri: jest
      .fn()
      .mockReturnValue(
        "otpauth://totp/OpenLogo:test@test.com?secret=MOCK_SECRET"
      ),
    verify: jest.fn(),
  },
}));

const MfaService = require("../../services/mfa");
const VerificationSessionRepository = require("../../repositories/verificationSession");
const { UsersRepository } = require("../../repositories");
const { Users } = require("../../models");
const { MOCK_USERS } = require("../../utils/mocks");
const { authenticator } = require("otplib");
const { encrypt, decrypt } = require("../../utils/crypto");
const QRCode = require("qrcode");

jest.mock("../../utils/crypto", () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));

jest.mock("qrcode");

describe("MFA Service", () => {
  let mfaService;

  beforeEach(() => {
    mfaService = new MfaService();
    jest.clearAllMocks();
  });

  describe("createSession", () => {
    it("should create a new MFA session successfully", async () => {
      const userId = MOCK_USERS[0]._id;
      const mockSession = {
        userId,
        sessionId: "a".repeat(128),
        sessionType: "MFA",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };

      jest
        .spyOn(VerificationSessionRepository.prototype, "create")
        .mockResolvedValue(mockSession);

      const result = await mfaService.createSession({ userId });

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.sessionType).toBe("MFA");
      expect(
        VerificationSessionRepository.prototype.create
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          sessionType: "MFA",
        })
      );
    });
  });

  describe("findAndUpdateActiveSession", () => {
    it("should find and update an active MFA session", async () => {
      const sessionId = "a".repeat(128);
      const mockSession = {
        sessionId,
        userId: MOCK_USERS[0]._id,
        sessionType: "MFA",
        usedAt: new Date(),
      };

      jest
        .spyOn(
          VerificationSessionRepository.prototype,
          "findAndUpdateActiveSession"
        )
        .mockResolvedValue(mockSession);

      const result = await mfaService.findAndUpdateActiveSession(sessionId);

      expect(result).toBeDefined();
      expect(result.sessionId).toBe(sessionId);
      expect(
        VerificationSessionRepository.prototype.findAndUpdateActiveSession
      ).toHaveBeenCalledWith({
        sessionType: "MFA",
        sessionId,
      });
    });
  });

  describe("enableMfa", () => {
    it("should enable MFA successfully and return QR code", async () => {
      const user = new Users(MOCK_USERS[0]);
      const mockQrCode = "data:image/png;base64,mockQrCode";

      QRCode.toDataURL.mockResolvedValue(mockQrCode);
      jest.spyOn(UsersRepository.prototype, "update").mockResolvedValue(user);

      const result = await mfaService.enableMfa(user);

      expect(result).toBeDefined();
      expect(result.qrCode).toBe(mockQrCode);
      expect(QRCode.toDataURL).toHaveBeenCalled();
      expect(UsersRepository.prototype.update).toHaveBeenCalledWith(
        user._id,
        expect.objectContaining({
          mfaTempSecret: expect.any(String),
          mfaTempSecretExpiresAt: expect.any(Number),
        })
      );
    });

    it("should return null if user update fails", async () => {
      const user = new Users(MOCK_USERS[0]);
      const mockQrCode = "data:image/png;base64,mockQrCode";

      QRCode.toDataURL.mockResolvedValue(mockQrCode);
      jest.spyOn(UsersRepository.prototype, "update").mockResolvedValue(null);

      const result = await mfaService.enableMfa(user);

      expect(result).toBeNull();
    });
  });

  describe("verifyMfa", () => {
    it("should verify MFA token successfully", () => {
      const user = new Users(MOCK_USERS[0]);
      user.mfaTempSecret = "JBSWY3DPEHPK3PXP";

      authenticator.verify.mockReturnValue(true);

      const result = mfaService.verifyMfa(user, "123456");

      expect(result).toBe(true);
      expect(authenticator.verify).toHaveBeenCalledWith({
        secret: user.mfaTempSecret,
        token: "123456",
      });
    });

    it("should return false if MFA token is invalid", () => {
      const user = new Users(MOCK_USERS[0]);
      user.mfaTempSecret = "JBSWY3DPEHPK3PXP";

      authenticator.verify.mockReturnValue(false);

      const result = mfaService.verifyMfa(user, "123456");

      expect(result).toBe(false);
    });
  });

  describe("updateMfaUser", () => {
    it("should update MFA user successfully", async () => {
      const user = new Users(MOCK_USERS[0]);
      user.mfaTempSecret = "JBSWY3DPEHPK3PXP";

      const updatedUser = {
        ...user.toObject(),
        mfaEnabled: true,
        mfaSecret: {
          encryptedValue: "encrypted",
          encryptedIv: "iv",
          encryptedTag: "tag",
        },
        mfaTempSecret: null,
        mfaTempSecretExpiresAt: null,
      };

      encrypt.mockReturnValue({ encrypted: "encrypted", iv: "iv", tag: "tag" });
      jest
        .spyOn(UsersRepository.prototype, "update")
        .mockResolvedValue(updatedUser);

      const result = await mfaService.updateMfaUser(user);

      expect(result).toBe(true);
      expect(encrypt).toHaveBeenCalledWith(user.mfaTempSecret);
      expect(UsersRepository.prototype.update).toHaveBeenCalledWith(
        user._id,
        expect.objectContaining({
          mfaEnabled: true,
          mfaSecret: {
            encryptedValue: "encrypted",
            encryptedIv: "iv",
            encryptedTag: "tag",
          },
          mfaTempSecret: null,
          mfaTempSecretExpiresAt: null,
        })
      );
    });

    it("should return false if user update fails", async () => {
      const user = new Users(MOCK_USERS[0]);
      user.mfaTempSecret = "JBSWY3DPEHPK3PXP";

      encrypt.mockReturnValue({ encrypted: "encrypted", iv: "iv", tag: "tag" });
      jest.spyOn(UsersRepository.prototype, "update").mockResolvedValue(null);

      const result = await mfaService.updateMfaUser(user);

      expect(result).toBe(false);
    });
  });

  describe("disableMfa", () => {
    it("should disable MFA successfully", async () => {
      const user = new Users(MOCK_USERS[0]);
      user.mfaEnabled = true;
      user.mfaSecret = {
        encryptedValue: "encrypted",
        encryptedIv: "iv",
        encryptedTag: "tag",
      };

      const updatedUser = {
        ...user.toObject(),
        mfaEnabled: false,
        mfaSecret: null,
        mfaTempSecret: null,
        mfaTempSecretExpiresAt: null,
      };

      jest
        .spyOn(UsersRepository.prototype, "update")
        .mockResolvedValue(updatedUser);

      const result = await mfaService.disableMfa(user);

      expect(result).toBe(true);
      expect(UsersRepository.prototype.update).toHaveBeenCalledWith(
        user._id,
        expect.objectContaining({
          mfaEnabled: false,
          mfaSecret: null,
          mfaTempSecret: null,
          mfaTempSecretExpiresAt: null,
        })
      );
    });

    it("should return false if user update fails", async () => {
      const user = new Users(MOCK_USERS[0]);

      jest.spyOn(UsersRepository.prototype, "update").mockResolvedValue(null);

      const result = await mfaService.disableMfa(user);

      expect(result).toBe(false);
    });
  });

  describe("mfaLogin", () => {
    it("should login with MFA successfully", () => {
      const user = new Users(MOCK_USERS[0]);
      user.mfaSecret = {
        encryptedValue: "encrypted",
        encryptedIv: "iv",
        encryptedTag: "tag",
      };

      decrypt.mockReturnValue("JBSWY3DPEHPK3PXP");
      authenticator.verify.mockReturnValue(true);

      const result = mfaService.mfaLogin(user, "123456");

      expect(result).toBe(true);
      expect(decrypt).toHaveBeenCalledWith("encrypted", "iv", "tag");
      expect(authenticator.verify).toHaveBeenCalledWith({
        token: "123456",
        secret: "JBSWY3DPEHPK3PXP",
      });
    });

    it("should return false if MFA login token is invalid", () => {
      const user = new Users(MOCK_USERS[0]);
      user.mfaSecret = {
        encryptedValue: "encrypted",
        encryptedIv: "iv",
        encryptedTag: "tag",
      };

      decrypt.mockReturnValue("JBSWY3DPEHPK3PXP");
      authenticator.verify.mockReturnValue(false);

      const result = mfaService.mfaLogin(user, "123456");

      expect(result).toBe(false);
    });
  });
});
