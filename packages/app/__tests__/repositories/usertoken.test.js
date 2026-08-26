const { UserTokenRepository } = require("../../repositories");
const UserToken = require("../../models/usertoken");
const { UserTokenTypes } = require("../../utils/constants");

describe("UserTokenRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new UserTokenRepository();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("fetchUserToken", () => {
    it("returns the token only when it is not deleted", async () => {
      const findOne = jest
        .spyOn(UserToken, "findOne")
        .mockResolvedValue({ token: "token-1" });

      const result = await repository.fetchUserToken("token-1");

      expect(findOne).toHaveBeenCalledWith({
        token: "token-1",
        is_deleted: false,
      });
      expect(result).toEqual({ token: "token-1" });
    });
  });

  describe("fetchDeletedUserToken", () => {
    it("returns the token only when it is deleted", async () => {
      const findOne = jest.spyOn(UserToken, "findOne").mockResolvedValue(null);

      const result = await repository.fetchDeletedUserToken("token-1");

      expect(findOne).toHaveBeenCalledWith({
        token: "token-1",
        is_deleted: true,
      });
      expect(result).toBeNull();
    });
  });

  describe("fetchUserTokenByUserIdTokenType", () => {
    it("looks up an active token of the given type for a user", async () => {
      const findOne = jest.spyOn(UserToken, "findOne").mockResolvedValue(null);

      await repository.fetchUserTokenByUserIdTokenType(
        "user-1",
        UserTokenTypes.VERIFY
      );

      expect(findOne).toHaveBeenCalledWith({
        user_id: "user-1",
        is_deleted: false,
        type: UserTokenTypes.VERIFY,
      });
    });
  });

  describe("updateUserToken", () => {
    it("extends a verification token by a day", async () => {
      const findOneAndUpdate = jest
        .spyOn(UserToken, "findOneAndUpdate")
        .mockResolvedValue({ token: "token-1" });

      const result = await repository.updateUserToken({
        token: "token-1",
        type: UserTokenTypes.VERIFY,
      });

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { token: "token-1", is_deleted: false },
        { $set: { expire_at: new Date("2026-04-28T12:00:00.000Z") } },
        { new: true }
      );
      expect(result).toEqual({ token: "token-1" });
    });

    it("extends a forgot-password token by ten minutes", async () => {
      const findOneAndUpdate = jest
        .spyOn(UserToken, "findOneAndUpdate")
        .mockResolvedValue({});

      await repository.updateUserToken({
        token: "token-1",
        type: UserTokenTypes.FORGOT,
      });

      expect(findOneAndUpdate.mock.calls[0][1]).toEqual({
        $set: { expire_at: new Date("2026-04-27T12:10:00.000Z") },
      });
    });

    it("keeps the current expiry for an unknown token type", async () => {
      const findOneAndUpdate = jest
        .spyOn(UserToken, "findOneAndUpdate")
        .mockResolvedValue({});
      const expireAt = new Date("2026-05-01T00:00:00.000Z");

      await repository.updateUserToken({
        token: "token-1",
        type: "UNKNOWN",
        expire_at: expireAt,
      });

      expect(findOneAndUpdate.mock.calls[0][1]).toEqual({
        $set: { expire_at: expireAt },
      });
    });
  });
});
