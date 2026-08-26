const { UsersRepository } = require("../../repositories");
const User = require("../../models/users");

describe("UsersRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new UsersRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("findUserByEmail", () => {
    it("looks up a user by email", async () => {
      const findOne = jest
        .spyOn(repository.model, "findOne")
        .mockResolvedValue({ email: "a@b.com" });

      const result = await repository.findUserByEmail("a@b.com");

      expect(findOne).toHaveBeenCalledWith({ email: "a@b.com" });
      expect(result).toEqual({ email: "a@b.com" });
    });
  });

  describe("getUsersCount", () => {
    it("counts only verified, non-deleted users", async () => {
      const countDocuments = jest
        .spyOn(User, "countDocuments")
        .mockResolvedValue(7);

      const result = await repository.getUsersCount();

      expect(countDocuments).toHaveBeenCalledWith({
        is_verified: true,
        is_deleted: false,
      });
      expect(result).toBe(7);
    });
  });

  describe("getGuestUser", () => {
    it("looks up the guest user by role", async () => {
      const findOne = jest
        .spyOn(repository.model, "findOne")
        .mockResolvedValue({ role: "GUEST" });

      const result = await repository.getGuestUser();

      expect(findOne).toHaveBeenCalledWith({ role: "GUEST" });
      expect(result).toEqual({ role: "GUEST" });
    });
  });

  describe("findUserBySubscriptionId", () => {
    it("returns a lean document with only the id selected", async () => {
      const lean = jest.fn().mockResolvedValue({ _id: "user-1" });
      const select = jest.fn().mockReturnValue({ lean });
      const findOne = jest
        .spyOn(repository.model, "findOne")
        .mockReturnValue({ select });

      const result = await repository.findUserBySubscriptionId("sub-1");

      expect(findOne).toHaveBeenCalledWith({ subscription_id: "sub-1" });
      expect(select).toHaveBeenCalledWith("_id");
      expect(result).toEqual({ _id: "user-1" });
    });
  });

  describe("findUsersWithSubscription", () => {
    const runPipeline = async (options, aggregateResult) => {
      const aggregate = jest
        .spyOn(repository.model, "aggregate")
        .mockResolvedValue(aggregateResult);

      const result = await repository.findUsersWithSubscription(options);

      return { pipeline: aggregate.mock.calls[0][0], result };
    };

    it("excludes deleted users and paginates the results", async () => {
      const { pipeline, result } = await runPipeline(
        { page: 3, limit: 5, includeDeleted: false },
        [{ data: [{ _id: "user-1" }], totalCount: [{ count: 42 }] }]
      );

      expect(pipeline[0].$match).toEqual({ is_deleted: false });
      const facet = pipeline[pipeline.length - 1].$facet;
      expect(facet.data).toEqual([{ $skip: 10 }, { $limit: 5 }]);
      expect(result).toEqual({ users: [{ _id: "user-1" }], total: 42 });
    });

    it("includes deleted users when requested", async () => {
      const { pipeline } = await runPipeline(
        { page: 1, limit: 10, includeDeleted: true },
        [{ data: [], totalCount: [] }]
      );

      expect(pipeline[0].$match).toEqual({});
    });

    it("restricts to customers with reward points when requested", async () => {
      const { pipeline } = await runPipeline(
        { page: 1, limit: 10, includeDeleted: true, hasRewardPoints: true },
        [{ data: [], totalCount: [] }]
      );

      expect(pipeline[0].$match).toEqual({
        role: "CUSTOMER",
        reward_points_current: { $gt: 0 },
      });
    });

    it("matches the search term against name and email", async () => {
      const { pipeline } = await runPipeline(
        {
          search: "john",
          page: 1,
          limit: 10,
          includeDeleted: false,
        },
        [{ data: [], totalCount: [] }]
      );

      const [nameCondition, emailCondition] = pipeline[0].$match.$or;
      expect(nameCondition.name).toEqual(/john/i);
      expect(emailCondition.email).toEqual(/john/i);
    });

    it("escapes regex metacharacters in the search term", async () => {
      const { pipeline } = await runPipeline(
        {
          search: "a.b+c(d)",
          page: 1,
          limit: 10,
          includeDeleted: false,
        },
        [{ data: [], totalCount: [] }]
      );

      expect(pipeline[0].$match.$or[0].name.source).toBe("a\\.b\\+c\\(d\\)");
    });

    it("returns empty defaults when the aggregation yields nothing", async () => {
      jest.spyOn(repository.model, "aggregate").mockResolvedValue([]);

      const result = await repository.findUsersWithSubscription({
        page: 1,
        limit: 10,
        includeDeleted: false,
      });

      expect(result).toEqual({ users: [], total: 0 });
    });
  });
});
