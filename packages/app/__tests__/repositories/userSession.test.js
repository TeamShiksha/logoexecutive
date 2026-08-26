const UserSessionRepository = require("../../repositories/userSession");
const { USER_SAFE_FIELDS } = require("../../utils/constants");

describe("UserSessionRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new UserSessionRepository();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const now = () => new Date("2026-04-27T12:00:00.000Z");

  describe("findBySessionId", () => {
    it("returns the active, non-expired session with safe user fields", async () => {
      const populate = jest.fn().mockResolvedValue({ sessionId: "abc" });
      const findOne = jest
        .spyOn(repository.model, "findOne")
        .mockReturnValue({ populate });

      const result = await repository.findBySessionId(123);

      expect(findOne).toHaveBeenCalledWith({
        sessionId: "123",
        isActive: true,
        expiresAt: { $gt: now() },
      });
      expect(populate).toHaveBeenCalledWith("userId", USER_SAFE_FIELDS);
      expect(result).toEqual({ sessionId: "abc" });
    });
  });

  describe("deactivateSession", () => {
    it("deactivates the active session and returns the updated document", async () => {
      const findOneAndUpdate = jest
        .spyOn(repository.model, "findOneAndUpdate")
        .mockResolvedValue({ isActive: false });

      const result = await repository.deactivateSession("abc");

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { sessionId: "abc", isActive: true },
        { isActive: false },
        { new: true }
      );
      expect(result).toEqual({ isActive: false });
    });
  });

  describe("deactivateAllUserSessions", () => {
    it("deactivates every active session of the user", async () => {
      const updateMany = jest
        .spyOn(repository.model, "updateMany")
        .mockResolvedValue({ modifiedCount: 3 });

      const result = await repository.deactivateAllUserSessions("user-1");

      expect(updateMany).toHaveBeenCalledWith(
        { userId: "user-1", isActive: true },
        { isActive: false }
      );
      expect(result).toEqual({ modifiedCount: 3 });
    });
  });

  describe("findActiveSessionByUser", () => {
    it("looks up a single active, non-expired session", async () => {
      const findOne = jest
        .spyOn(repository.model, "findOne")
        .mockResolvedValue(null);

      const result = await repository.findActiveSessionByUser("user-1");

      expect(findOne).toHaveBeenCalledWith({
        userId: "user-1",
        isActive: true,
        expiresAt: { $gt: now() },
      });
      expect(result).toBeNull();
    });
  });

  describe("findAllActiveSessionsByUser", () => {
    it("returns the fields needed by the sessions UI, most recent first", async () => {
      const sort = jest.fn().mockResolvedValue([{ sessionId: "abc" }]);
      const select = jest.fn().mockReturnValue({ sort });
      const find = jest
        .spyOn(repository.model, "find")
        .mockReturnValue({ select });

      const result = await repository.findAllActiveSessionsByUser("user-1");

      expect(find).toHaveBeenCalledWith({
        userId: "user-1",
        isActive: true,
        expiresAt: { $gt: now() },
      });
      expect(select).toHaveBeenCalledWith(
        "sessionId deviceInfo createdAt lastActiveAt"
      );
      expect(sort).toHaveBeenCalledWith({ lastActiveAt: -1 });
      expect(result).toEqual([{ sessionId: "abc" }]);
    });
  });

  describe("deactivateSessionByUser", () => {
    it("scopes the deactivation to the owning user", async () => {
      const findOneAndUpdate = jest
        .spyOn(repository.model, "findOneAndUpdate")
        .mockResolvedValue(null);

      const result = await repository.deactivateSessionByUser("user-1", 456);

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { userId: "user-1", sessionId: "456", isActive: true },
        { isActive: false },
        { new: true }
      );
      expect(result).toBeNull();
    });
  });

  describe("deactivateOtherSessions", () => {
    it("keeps the current session active", async () => {
      const updateMany = jest
        .spyOn(repository.model, "updateMany")
        .mockResolvedValue({ modifiedCount: 2 });

      const result = await repository.deactivateOtherSessions("user-1", "abc");

      expect(updateMany).toHaveBeenCalledWith(
        { userId: "user-1", isActive: true, sessionId: { $ne: "abc" } },
        { isActive: false }
      );
      expect(result).toEqual({ modifiedCount: 2 });
    });
  });

  describe("updateLastActive", () => {
    it("stamps the session with the current time", async () => {
      const findOneAndUpdate = jest
        .spyOn(repository.model, "findOneAndUpdate")
        .mockResolvedValue({});

      await repository.updateLastActive("abc");

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { sessionId: "abc", isActive: true },
        { lastActiveAt: now() }
      );
    });
  });
});
