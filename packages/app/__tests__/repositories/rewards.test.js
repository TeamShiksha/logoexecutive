const { RewardsRepository } = require("../../repositories");

describe("RewardsRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new RewardsRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("findOrCreateByImageId", () => {
    it("returns the existing reward without creating a new one", async () => {
      const findOne = jest
        .spyOn(repository.model, "findOne")
        .mockResolvedValue({ _id: "reward-1" });
      const create = jest.spyOn(repository, "create");

      const result = await repository.findOrCreateByImageId(
        "image-1",
        "user-1"
      );

      expect(findOne).toHaveBeenCalledWith({ image_id: "image-1" });
      expect(create).not.toHaveBeenCalled();
      expect(result).toEqual({ _id: "reward-1" });
    });

    it("binds the session when looking up the reward", async () => {
      const session = { id: "session" };
      const sessionFn = jest.fn().mockResolvedValue({ _id: "reward-1" });
      jest
        .spyOn(repository.model, "findOne")
        .mockReturnValue({ session: sessionFn });

      const result = await repository.findOrCreateByImageId(
        "image-1",
        "user-1",
        { session }
      );

      expect(sessionFn).toHaveBeenCalledWith(session);
      expect(result).toEqual({ _id: "reward-1" });
    });

    it("creates a reward when none exists for the image", async () => {
      jest.spyOn(repository.model, "findOne").mockResolvedValue(null);
      const create = jest
        .spyOn(repository, "create")
        .mockResolvedValue({ _id: "reward-new" });

      const result = await repository.findOrCreateByImageId(
        "image-1",
        "user-1"
      );

      expect(create).toHaveBeenCalledWith(
        { image_id: "image-1", user_id: "user-1", unique_pro_users: [] },
        { session: undefined }
      );
      expect(result).toEqual({ _id: "reward-new" });
    });
  });

  describe("findByImageId", () => {
    it("looks up the reward by image", async () => {
      const findOne = jest
        .spyOn(repository.model, "findOne")
        .mockResolvedValue(null);

      const result = await repository.findByImageId("image-1");

      expect(findOne).toHaveBeenCalledWith({ image_id: "image-1" });
      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("returns the user's rewards with image details populated", async () => {
      const populate = jest.fn().mockResolvedValue([{ _id: "reward-1" }]);
      const find = jest
        .spyOn(repository.model, "find")
        .mockReturnValue({ populate });

      const result = await repository.findByUserId("user-1");

      expect(find).toHaveBeenCalledWith({ user_id: "user-1" });
      expect(populate).toHaveBeenCalledWith(
        "image_id",
        "company_name extension"
      );
      expect(result).toEqual([{ _id: "reward-1" }]);
    });
  });

  describe("updateByImageId", () => {
    it("always requests the updated document", async () => {
      const findOneAndUpdate = jest
        .spyOn(repository.model, "findOneAndUpdate")
        .mockResolvedValue({ _id: "reward-1" });

      const result = await repository.updateByImageId("image-1", {
        $inc: { total_points_awarded: 5 },
      });

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { image_id: "image-1" },
        { $inc: { total_points_awarded: 5 } },
        { new: true }
      );
      expect(result).toEqual({ _id: "reward-1" });
    });

    it("merges caller options with the new flag", async () => {
      const findOneAndUpdate = jest
        .spyOn(repository.model, "findOneAndUpdate")
        .mockResolvedValue(null);
      const session = { id: "session" };

      await repository.updateByImageId("image-1", { $set: {} }, { session });

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { image_id: "image-1" },
        { $set: {} },
        { session, new: true }
      );
    });
  });

  describe("getLeaderboardAggregated", () => {
    it("limits the leaderboard to the requested size", async () => {
      const aggregate = jest
        .spyOn(repository.model, "aggregate")
        .mockResolvedValue([{ userId: "user-1" }]);

      const result = await repository.getLeaderboardAggregated(3);

      const pipeline = aggregate.mock.calls[0][0];
      expect(pipeline).toContainEqual({ $limit: 3 });
      expect(pipeline).toContainEqual({ $sort: { totalPointsAwarded: -1 } });
      expect(result).toEqual([{ userId: "user-1" }]);
    });

    it("defaults the leaderboard to ten entries", async () => {
      const aggregate = jest
        .spyOn(repository.model, "aggregate")
        .mockResolvedValue([]);

      await repository.getLeaderboardAggregated();

      expect(aggregate.mock.calls[0][0]).toContainEqual({ $limit: 10 });
    });
  });

  describe("getUserRankAggregated", () => {
    it("returns the user's rank and points", async () => {
      jest.spyOn(repository.model, "aggregate").mockResolvedValue([
        { _id: "user-a", totalPointsAwarded: 30 },
        { _id: "user-b", totalPointsAwarded: 20 },
      ]);

      const result = await repository.getUserRankAggregated("user-b");

      expect(result).toEqual({ rank: 2, totalPoints: 20, totalUsers: 2 });
    });

    it("returns a null rank when the user has no rewards", async () => {
      jest
        .spyOn(repository.model, "aggregate")
        .mockResolvedValue([{ _id: "user-a", totalPointsAwarded: 30 }]);

      const result = await repository.getUserRankAggregated("user-b");

      expect(result).toEqual({ rank: null, totalPoints: 0, totalUsers: 1 });
    });

    it("compares ids by their string representation", async () => {
      jest
        .spyOn(repository.model, "aggregate")
        .mockResolvedValue([
          { _id: { toString: () => "user-a" }, totalPointsAwarded: 30 },
        ]);

      const result = await repository.getUserRankAggregated({
        toString: () => "user-a",
      });

      expect(result).toEqual({ rank: 1, totalPoints: 30, totalUsers: 1 });
    });
  });
});
