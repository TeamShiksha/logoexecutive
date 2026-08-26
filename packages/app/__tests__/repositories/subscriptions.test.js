const {
  SubscriptionsRepository,
  SubscriptionLogRepository,
} = require("../../repositories");
const Subscriptions = require("../../models/subscriptions");

describe("SubscriptionsRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new SubscriptionsRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getSubscriptionUsageCount", () => {
    it("sums the usage count of active subscriptions", async () => {
      const aggregate = jest
        .spyOn(Subscriptions, "aggregate")
        .mockResolvedValue([{ _id: null, totalUsage: 120 }]);

      const result = await repository.getSubscriptionUsageCount();

      const pipeline = aggregate.mock.calls[0][0];
      expect(pipeline[0]).toEqual({ $match: { is_active: true } });
      expect(pipeline[1].$group.totalUsage).toEqual({ $sum: "$usage_count" });
      expect(result).toBe(120);
    });

    it("returns zero when there are no active subscriptions", async () => {
      jest.spyOn(Subscriptions, "aggregate").mockResolvedValue([]);

      const result = await repository.getSubscriptionUsageCount();

      expect(result).toBe(0);
    });
  });
});

describe("SubscriptionLogRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new SubscriptionLogRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("findPaginated", () => {
    const createQueryMock = (result) => {
      const query = {
        populateCalls: [],
        select: jest.fn().mockResolvedValue(result),
      };
      query.populate = jest.fn((...args) => {
        query.populateCalls.push(args);
        return query;
      });
      query.sort = jest.fn().mockReturnValue(query);
      query.skip = jest.fn().mockReturnValue(query);
      query.limit = jest.fn().mockReturnValue(query);
      return query;
    };

    it("returns the requested page with user and admin names populated", async () => {
      const query = createQueryMock([{ _id: "log-1" }]);
      const find = jest.spyOn(repository.model, "find").mockReturnValue(query);
      jest.spyOn(repository.model, "countDocuments").mockResolvedValue(7);

      const result = await repository.findPaginated(2, 5);

      expect(find).toHaveBeenCalledWith({});
      expect(query.populateCalls).toEqual([
        ["user_id", "name email"],
        ["changed_by", "name email"],
      ]);
      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(query.skip).toHaveBeenCalledWith(5);
      expect(query.limit).toHaveBeenCalledWith(5);
      expect(query.select).toHaveBeenCalledWith("-__v");
      expect(result).toEqual({
        logs: [{ _id: "log-1" }],
        total: 7,
        totalPages: 2,
      });
    });

    it("defaults to the first page with twenty records", async () => {
      const query = createQueryMock([]);
      jest.spyOn(repository.model, "find").mockReturnValue(query);
      jest.spyOn(repository.model, "countDocuments").mockResolvedValue(0);

      const result = await repository.findPaginated();

      expect(query.skip).toHaveBeenCalledWith(0);
      expect(query.limit).toHaveBeenCalledWith(20);
      expect(result.totalPages).toBe(0);
    });
  });
});
