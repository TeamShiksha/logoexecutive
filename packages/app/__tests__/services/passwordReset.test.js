const PasswordResetService = require("../../services/passwordReset");
const { TEMPORARY_SESSION_TYPES } = require("../../utils/constants");

describe("PasswordResetSessionService", () => {
  let service;
  let repository;

  beforeEach(() => {
    service = new PasswordResetService();
    repository = service.verificationSessionRepository;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("generateSessionId", () => {
    it("generates a 128-character hex identifier", () => {
      expect(service.generateSessionId()).toMatch(/^[0-9a-f]{128}$/);
    });
  });

  describe("createSession", () => {
    it("creates a password reset session that expires in ten minutes", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));
      const create = jest
        .spyOn(repository, "create")
        .mockResolvedValue({ sessionId: "created" });

      const result = await service.createSession({
        userId: "user-1",
        resetToken: "reset-token",
      });

      const payload = create.mock.calls[0][0];
      expect(payload).toMatchObject({
        userId: "user-1",
        sessionType: TEMPORARY_SESSION_TYPES.PASSWORD_RESET,
        token: "reset-token",
      });
      expect(payload.sessionId).toMatch(/^[0-9a-f]{128}$/);
      expect(payload.expiresAt).toEqual(new Date("2026-04-27T12:10:00.000Z"));
      expect(result).toEqual({ sessionId: "created" });
    });
  });

  describe("findAndUpdateActiveSession", () => {
    it("consumes the active password reset session", async () => {
      const findAndUpdateActiveSession = jest
        .spyOn(repository, "findAndUpdateActiveSession")
        .mockResolvedValue({ sessionId: "abc" });

      const result = await service.findAndUpdateActiveSession("abc");

      expect(findAndUpdateActiveSession).toHaveBeenCalledWith({
        sessionType: TEMPORARY_SESSION_TYPES.PASSWORD_RESET,
        sessionId: "abc",
      });
      expect(result).toEqual({ sessionId: "abc" });
    });
  });
});
