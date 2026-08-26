const UserSessionService = require("../../services/userSession");

const MAX_SESSIONS_PER_USER = 5;

describe("UserSessionService", () => {
  let service;
  let repository;

  beforeEach(() => {
    service = new UserSessionService();
    repository = service.userSessionRepository;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("generateSessionId", () => {
    it("generates a 128-character hex identifier", () => {
      const sessionId = service.generateSessionId();

      expect(sessionId).toMatch(/^[0-9a-f]{128}$/);
    });

    it("generates a different identifier on every call", () => {
      expect(service.generateSessionId()).not.toBe(service.generateSessionId());
    });
  });

  describe("parseUserAgent", () => {
    it("extracts the browser, os and device type", () => {
      const userAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

      expect(service.parseUserAgent(userAgent)).toEqual({
        browser: "Mobile Safari",
        os: "iOS",
        deviceType: "mobile",
      });
    });

    it("falls back to unknown desktop values for an empty user agent", () => {
      expect(service.parseUserAgent("")).toEqual({
        browser: "Unknown",
        os: "Unknown",
        deviceType: "desktop",
      });
    });

    it("falls back to unknown desktop values when no user agent is given", () => {
      expect(service.parseUserAgent(undefined)).toEqual({
        browser: "Unknown",
        os: "Unknown",
        deviceType: "desktop",
      });
    });
  });

  describe("createSession", () => {
    it("creates a session that expires in seven days", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));
      jest
        .spyOn(repository, "findAllActiveSessionsByUser")
        .mockResolvedValue([]);
      const deactivateSession = jest.spyOn(repository, "deactivateSession");
      const create = jest
        .spyOn(repository, "create")
        .mockResolvedValue({ sessionId: "created" });

      const result = await service.createSession({
        userId: "user-1",
        userAgent: "",
      });

      expect(deactivateSession).not.toHaveBeenCalled();
      const payload = create.mock.calls[0][0];
      expect(payload.userId).toBe("user-1");
      expect(payload.sessionId).toMatch(/^[0-9a-f]{128}$/);
      expect(payload.expiresAt).toEqual(new Date("2026-05-04T12:00:00.000Z"));
      expect(payload.deviceInfo).toEqual({
        browser: "Unknown",
        os: "Unknown",
        deviceType: "desktop",
      });
      expect(result).toEqual({ sessionId: "created" });
    });

    it("revokes the oldest session once the per-user cap is reached", async () => {
      const activeSessions = Array.from(
        { length: MAX_SESSIONS_PER_USER },
        (_, index) => ({ sessionId: `session-${index}` })
      );
      jest
        .spyOn(repository, "findAllActiveSessionsByUser")
        .mockResolvedValue(activeSessions);
      const deactivateSession = jest
        .spyOn(repository, "deactivateSession")
        .mockResolvedValue({});
      jest.spyOn(repository, "create").mockResolvedValue({});

      await service.createSession({ userId: "user-1" });

      expect(deactivateSession).toHaveBeenCalledWith(
        `session-${MAX_SESSIONS_PER_USER - 1}`
      );
    });

    it("keeps existing sessions when below the cap", async () => {
      jest
        .spyOn(repository, "findAllActiveSessionsByUser")
        .mockResolvedValue([{ sessionId: "session-0" }]);
      const deactivateSession = jest.spyOn(repository, "deactivateSession");
      jest.spyOn(repository, "create").mockResolvedValue({});

      await service.createSession({ userId: "user-1" });

      expect(deactivateSession).not.toHaveBeenCalled();
    });
  });

  describe("delegating methods", () => {
    it("validates a session by id", async () => {
      const findBySessionId = jest
        .spyOn(repository, "findBySessionId")
        .mockResolvedValue({ sessionId: "abc" });

      const result = await service.validateSession("abc");

      expect(findBySessionId).toHaveBeenCalledWith("abc");
      expect(result).toEqual({ sessionId: "abc" });
    });

    it("looks up a user's active session", async () => {
      const findActiveSessionByUser = jest
        .spyOn(repository, "findActiveSessionByUser")
        .mockResolvedValue(null);

      const result = await service.userActiveSession("user-1");

      expect(findActiveSessionByUser).toHaveBeenCalledWith("user-1");
      expect(result).toBeNull();
    });

    it("signs out the current session", async () => {
      const deactivateSession = jest
        .spyOn(repository, "deactivateSession")
        .mockResolvedValue({ isActive: false });

      const result = await service.signout("abc");

      expect(deactivateSession).toHaveBeenCalledWith("abc");
      expect(result).toEqual({ isActive: false });
    });

    it("lists the active sessions of a user", async () => {
      const findAllActiveSessionsByUser = jest
        .spyOn(repository, "findAllActiveSessionsByUser")
        .mockResolvedValue([{ sessionId: "abc" }]);

      const result = await service.getActiveSessions("user-1");

      expect(findAllActiveSessionsByUser).toHaveBeenCalledWith("user-1");
      expect(result).toEqual([{ sessionId: "abc" }]);
    });

    it("revokes a session scoped to its owner", async () => {
      const deactivateSessionByUser = jest
        .spyOn(repository, "deactivateSessionByUser")
        .mockResolvedValue(null);

      const result = await service.revokeSession("user-1", "abc");

      expect(deactivateSessionByUser).toHaveBeenCalledWith("user-1", "abc");
      expect(result).toBeNull();
    });

    it("revokes every session except the current one", async () => {
      const deactivateOtherSessions = jest
        .spyOn(repository, "deactivateOtherSessions")
        .mockResolvedValue({ modifiedCount: 2 });

      const result = await service.revokeOtherSessions("user-1", "abc");

      expect(deactivateOtherSessions).toHaveBeenCalledWith("user-1", "abc");
      expect(result).toEqual({ modifiedCount: 2 });
    });

    it("signs out every session of a user", async () => {
      const deactivateAllUserSessions = jest
        .spyOn(repository, "deactivateAllUserSessions")
        .mockResolvedValue({ modifiedCount: 3 });

      const result = await service.signoutAll("user-1");

      expect(deactivateAllUserSessions).toHaveBeenCalledWith("user-1");
      expect(result).toEqual({ modifiedCount: 3 });
    });

    it("touches a session to refresh its activity timestamp", async () => {
      const updateLastActive = jest
        .spyOn(repository, "updateLastActive")
        .mockResolvedValue({});

      await service.touchSession("abc");

      expect(updateLastActive).toHaveBeenCalledWith("abc");
    });
  });
});
