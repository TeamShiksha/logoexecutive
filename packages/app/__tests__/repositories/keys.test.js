const { KeysRepository } = require("../../repositories");
const Keys = require("../../models/keys");

describe("KeysRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new KeysRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getMultipleKeys", () => {
    it("returns the selected fields for the requested ids", async () => {
      const select = jest.fn().mockResolvedValue([{ _id: "key-1" }]);
      const find = jest
        .spyOn(repository.model, "find")
        .mockReturnValue({ select });

      const result = await repository.getMultipleKeys(["key-1", "key-2"]);

      expect(find).toHaveBeenCalledWith({
        _id: { $in: ["key-1", "key-2"] },
      });
      expect(select).toHaveBeenCalledWith(
        "key_description subscription_id updated_at expires_at _id"
      );
      expect(result).toEqual([{ _id: "key-1" }]);
    });
  });

  describe("getKeysCount", () => {
    it("counts all keys", async () => {
      const countDocuments = jest
        .spyOn(Keys, "countDocuments")
        .mockResolvedValue(4);

      const result = await repository.getKeysCount();

      expect(countDocuments).toHaveBeenCalledWith();
      expect(result).toBe(4);
    });
  });

  describe("fetchUserWithSubscription", () => {
    it("joins the subscription of the key owner", async () => {
      const aggregate = jest
        .spyOn(Keys, "aggregate")
        .mockResolvedValue([{ subscriptionDetails: { is_active: true } }]);

      const result = await repository.fetchUserWithSubscription("api-key");

      const pipeline = aggregate.mock.calls[0][0];
      expect(pipeline[0]).toEqual({ $match: { api_key: "api-key" } });
      expect(pipeline[1].$lookup.from).toBe("subscriptions");
      expect(pipeline[2]).toEqual({ $unwind: "$subscriptionDetails" });
      expect(result).toEqual([{ subscriptionDetails: { is_active: true } }]);
    });
  });

  describe("getApiKey", () => {
    it("looks up a key by its api key value", async () => {
      const findOne = jest.spyOn(Keys, "findOne").mockResolvedValue(null);

      const result = await repository.getApiKey("api-key");

      expect(findOne).toHaveBeenCalledWith({ api_key: "api-key" });
      expect(result).toBeNull();
    });
  });

  describe("updateOldKeys", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("extends the expiry of the given keys by a year", async () => {
      const updateMany = jest
        .spyOn(Keys, "updateMany")
        .mockResolvedValue({ modifiedCount: 2 });

      const result = await repository.updateOldKeys(["key-1", "key-2"]);

      expect(updateMany).toHaveBeenCalledWith(
        { _id: { $in: ["key-1", "key-2"] } },
        { $set: { expires_at: new Date("2027-04-27T12:00:00.000Z") } }
      );
      expect(result).toBe(true);
    });

    it("returns false when no key was modified", async () => {
      jest.spyOn(Keys, "updateMany").mockResolvedValue({ modifiedCount: 0 });

      const result = await repository.updateOldKeys(["key-1"]);

      expect(result).toBe(false);
    });

    it("logs and rethrows update failures", async () => {
      const error = new Error("db down");
      jest.spyOn(Keys, "updateMany").mockRejectedValue(error);
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(repository.updateOldKeys(["key-1"])).rejects.toThrow(
        "db down"
      );
      expect(consoleError).toHaveBeenCalledWith(
        "Error updating old keys:",
        error
      );
    });
  });
});
