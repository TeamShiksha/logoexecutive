const { RewardTransactionsRepository } = require("../../repositories");

/**
 * Mongoose queries used by this repository are chained
 * (find -> sort -> skip -> limit -> populate), so the mock returns itself for
 * every chained call and resolves to `result` when awaited.
 */
const createQueryMock = (result) => {
  const query = {
    populateCalls: [],
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  query.sort = jest.fn().mockReturnValue(query);
  query.skip = jest.fn().mockReturnValue(query);
  query.limit = jest.fn().mockReturnValue(query);
  query.populate = jest.fn((...args) => {
    query.populateCalls.push(args);
    return query;
  });
  return query;
};

describe("RewardTransactionsRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new RewardTransactionsRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createTransaction", () => {
    it("delegates to the base create with the session", async () => {
      const create = jest
        .spyOn(repository, "create")
        .mockResolvedValue({ _id: "tx-1" });
      const session = { id: "session" };

      const result = await repository.createTransaction(
        { points_awarded: 5 },
        { session }
      );

      expect(create).toHaveBeenCalledWith({ points_awarded: 5 }, { session });
      expect(result).toEqual({ _id: "tx-1" });
    });

    it("delegates to the base create without a session", async () => {
      const create = jest.spyOn(repository, "create").mockResolvedValue({});

      await repository.createTransaction({ points_awarded: 1 });

      expect(create).toHaveBeenCalledWith(
        { points_awarded: 1 },
        { session: undefined }
      );
    });
  });

  describe("getTransactionsByUserId", () => {
    it("paginates the user's transactions newest first", async () => {
      jest.spyOn(repository.model, "countDocuments").mockResolvedValue(25);
      const query = createQueryMock([{ _id: "tx-1" }]);
      const find = jest.spyOn(repository.model, "find").mockReturnValue(query);

      const result = await repository.getTransactionsByUserId("user-1", 2, 10);

      expect(find).toHaveBeenCalledWith({ user_id: "user-1" });
      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(query.skip).toHaveBeenCalledWith(10);
      expect(query.limit).toHaveBeenCalledWith(10);
      expect(query.populateCalls).toEqual([
        ["image_id", "company_name"],
        ["user_id", "name email"],
        ["reversed_by", "name email"],
      ]);
      expect(result).toEqual({
        data: [{ _id: "tx-1" }],
        total: 25,
        currentPage: 2,
        totalPages: 3,
      });
    });

    it("defaults to the first page with 20 records", async () => {
      jest.spyOn(repository.model, "countDocuments").mockResolvedValue(0);
      const query = createQueryMock([]);
      jest.spyOn(repository.model, "find").mockReturnValue(query);

      const result = await repository.getTransactionsByUserId("user-1");

      expect(query.skip).toHaveBeenCalledWith(0);
      expect(query.limit).toHaveBeenCalledWith(20);
      expect(result.totalPages).toBe(0);
    });
  });

  describe("getTransactionsByImageId", () => {
    it("paginates the image's transactions newest first", async () => {
      jest.spyOn(repository.model, "countDocuments").mockResolvedValue(3);
      const query = createQueryMock([{ _id: "tx-2" }]);
      const find = jest.spyOn(repository.model, "find").mockReturnValue(query);

      const result = await repository.getTransactionsByImageId("image-1", 1, 2);

      expect(find).toHaveBeenCalledWith({ image_id: "image-1" });
      expect(query.populateCalls).toEqual([
        ["user_id", "name email"],
        ["reversed_by", "name email"],
      ]);
      expect(result).toEqual({
        data: [{ _id: "tx-2" }],
        total: 3,
        currentPage: 1,
        totalPages: 2,
      });
    });
  });

  describe("getTransactionById", () => {
    it("populates the related image and users", async () => {
      const query = createQueryMock({ _id: "tx-1" });
      const findById = jest
        .spyOn(repository.model, "findById")
        .mockReturnValue(query);

      const result = await repository.getTransactionById("tx-1");

      expect(findById).toHaveBeenCalledWith("tx-1");
      expect(query.populateCalls).toHaveLength(3);
      expect(result).toEqual({ _id: "tx-1" });
    });
  });

  describe("reverseTransaction", () => {
    it("marks the transaction as reversed with the reason and actor", async () => {
      const findByIdAndUpdate = jest
        .spyOn(repository.model, "findByIdAndUpdate")
        .mockResolvedValue({ is_reversed: true });

      const result = await repository.reverseTransaction(
        "tx-1",
        "admin-1",
        "duplicate"
      );

      const [id, update, options] = findByIdAndUpdate.mock.calls[0];
      expect(id).toBe("tx-1");
      expect(update).toMatchObject({
        is_reversed: true,
        reversed_by: "admin-1",
        reversal_reason: "duplicate",
      });
      expect(update.reversed_at).toBeInstanceOf(Date);
      expect(update.updated_at).toBeInstanceOf(Date);
      expect(options).toEqual({ new: true });
      expect(result).toEqual({ is_reversed: true });
    });
  });

  describe("getUserTransactionStats", () => {
    it("returns the aggregated statistics for the user", async () => {
      const stats = {
        transaction_types: [{ type: "BONUS", count: 2, total_points: 20 }],
        total_transactions: 2,
        total_points_awarded: 20,
      };
      const aggregate = jest
        .spyOn(repository.model, "aggregate")
        .mockResolvedValue([stats]);

      const result = await repository.getUserTransactionStats("user-1");

      expect(aggregate.mock.calls[0][0][0].$match).toEqual({
        user_id: "user-1",
        is_reversed: false,
      });
      expect(result).toEqual(stats);
    });

    it("returns zeroed statistics when the user has no transactions", async () => {
      jest.spyOn(repository.model, "aggregate").mockResolvedValue([]);

      const result = await repository.getUserTransactionStats("user-1");

      expect(result).toEqual({
        transaction_types: [],
        total_transactions: 0,
        total_points_awarded: 0,
      });
    });
  });

  describe("getAuditTrail", () => {
    it("returns the image's transactions for a creator oldest first", async () => {
      const query = createQueryMock([{ _id: "tx-1" }]);
      const find = jest.spyOn(repository.model, "find").mockReturnValue(query);

      const result = await repository.getAuditTrail("image-1", "user-1");

      expect(find).toHaveBeenCalledWith({
        image_id: "image-1",
        user_id: "user-1",
      });
      expect(query.sort).toHaveBeenCalledWith({ createdAt: 1 });
      expect(result).toEqual([{ _id: "tx-1" }]);
    });
  });

  describe("searchTransactions", () => {
    const search = async (filters, page, limit) => {
      jest.spyOn(repository.model, "countDocuments").mockResolvedValue(1);
      const query = createQueryMock([{ _id: "tx-1" }]);
      const find = jest.spyOn(repository.model, "find").mockReturnValue(query);

      const result = await repository.searchTransactions(filters, page, limit);

      return { builtQuery: find.mock.calls[0][0], query, result };
    };

    it("builds an empty query when no filters are given", async () => {
      const { builtQuery, result } = await search({});

      expect(builtQuery).toEqual({});
      expect(result).toEqual({
        data: [{ _id: "tx-1" }],
        total: 1,
        currentPage: 1,
        totalPages: 1,
      });
    });

    it("maps every supported filter onto the query", async () => {
      const { builtQuery } = await search({
        userId: "user-1",
        imageId: "image-1",
        transactionType: "BONUS",
        isReversed: false,
        reason: "milestone",
      });

      expect(builtQuery).toEqual({
        user_id: "user-1",
        image_id: "image-1",
        transaction_type: "BONUS",
        is_reversed: false,
        reason: "milestone",
      });
    });

    it("builds a date range from the start and end dates", async () => {
      const { builtQuery } = await search({
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      });

      expect(builtQuery.createdAt.$gte).toEqual(new Date("2026-01-01"));
      expect(builtQuery.createdAt.$lte).toEqual(new Date("2026-01-31"));
    });

    it("builds an open-ended range from the start date only", async () => {
      const { builtQuery } = await search({ startDate: "2026-01-01" });

      expect(builtQuery.createdAt).toEqual({
        $gte: new Date("2026-01-01"),
      });
    });

    it("paginates the search results", async () => {
      const { query } = await search({}, 3, 5);

      expect(query.skip).toHaveBeenCalledWith(10);
      expect(query.limit).toHaveBeenCalledWith(5);
    });
  });
});
