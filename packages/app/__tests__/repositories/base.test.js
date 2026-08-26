const BaseRepository = require("../../repositories/base");

/**
 * Builds a mock mongoose model whose static query methods return chainable
 * thenable objects, so `await model.find(...).sort(...)` style calls work.
 */
const createModelMock = () => {
  const save = jest.fn().mockResolvedValue({ _id: "created" });

  function Model(data) {
    this.data = data;
    this.save = save;
  }

  Model.save = save;
  Model.find = jest.fn();
  Model.findById = jest.fn();
  Model.countDocuments = jest.fn();
  Model.findByIdAndUpdate = jest.fn();
  Model.findOneAndUpdate = jest.fn();
  Model.findByIdAndDelete = jest.fn();

  return Model;
};

const createQueryMock = (result) => {
  const query = {
    select: jest.fn(),
    session: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  query.select.mockReturnValue(query);
  query.session.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  query.skip.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  return query;
};

describe("BaseRepository", () => {
  let Model;
  let repository;

  beforeEach(() => {
    Model = createModelMock();
    repository = new BaseRepository(Model);
  });

  describe("find", () => {
    it("returns documents without binding a session by default", async () => {
      const query = createQueryMock(["doc"]);
      Model.find.mockReturnValue(query);

      const result = await repository.find({ name: "openlogo" });

      expect(Model.find).toHaveBeenCalledWith({ name: "openlogo" });
      expect(query.session).not.toHaveBeenCalled();
      expect(result).toEqual(["doc"]);
    });

    it("binds the provided session to the query", async () => {
      const query = createQueryMock([]);
      Model.find.mockReturnValue(query);
      const session = { id: "session" };

      await repository.find({}, { session });

      expect(query.session).toHaveBeenCalledWith(session);
    });
  });

  describe("getById", () => {
    it("excludes the version key and skips the session when not provided", async () => {
      const query = createQueryMock({ _id: "1" });
      Model.findById.mockReturnValue(query);

      const result = await repository.getById("1");

      expect(Model.findById).toHaveBeenCalledWith("1");
      expect(query.select).toHaveBeenCalledWith("-__v");
      expect(query.session).not.toHaveBeenCalled();
      expect(result).toEqual({ _id: "1" });
    });

    it("binds the provided session to the query", async () => {
      const query = createQueryMock(null);
      Model.findById.mockReturnValue(query);
      const session = { id: "session" };

      await repository.getById("1", { session });

      expect(query.session).toHaveBeenCalledWith(session);
    });
  });

  describe("getAll", () => {
    it("filters pending records sorted oldest first for the active tab", async () => {
      Model.countDocuments.mockResolvedValue(3);
      const query = createQueryMock(["doc"]);
      Model.find.mockReturnValue(query);

      const result = await repository.getAll(2, 2);

      expect(Model.countDocuments).toHaveBeenCalledWith({ status: "PENDING" });
      expect(Model.find).toHaveBeenCalledWith({ status: "PENDING" });
      expect(query.sort).toHaveBeenCalledWith({ openedAt: 1 });
      expect(query.skip).toHaveBeenCalledWith(2);
      expect(query.limit).toHaveBeenCalledWith(2);
      expect(result).toEqual({
        data: ["doc"],
        total: 3,
        currentPage: 2,
        totalPages: 2,
      });
    });

    it("filters closed records sorted newest first for the archived tab", async () => {
      Model.countDocuments.mockResolvedValue(1);
      const query = createQueryMock([]);
      Model.find.mockReturnValue(query);

      await repository.getAll(1, 10, "archived");

      expect(Model.find).toHaveBeenCalledWith({
        status: { $in: ["REJECTED", "RESOLVED", "COMPLETED"] },
      });
      expect(query.sort).toHaveBeenCalledWith({ closedAt: -1 });
    });

    it("applies no status filter for an unknown tab", async () => {
      Model.countDocuments.mockResolvedValue(0);
      const query = createQueryMock([]);
      Model.find.mockReturnValue(query);

      const result = await repository.getAll(1, 10, "all");

      expect(Model.find).toHaveBeenCalledWith({});
      expect(query.sort).toHaveBeenCalledWith({});
      expect(result.totalPages).toBe(0);
    });
  });

  describe("create", () => {
    it("saves a new document without session options", async () => {
      const result = await repository.create({ name: "openlogo" });

      expect(Model.save).toHaveBeenCalledWith();
      expect(result).toEqual({ _id: "created" });
    });

    it("saves a new document within the provided session", async () => {
      const session = { id: "session" };

      await repository.create({ name: "openlogo" }, { session });

      expect(Model.save).toHaveBeenCalledWith({ session });
    });
  });

  describe("update", () => {
    it("updates by id with empty options by default", async () => {
      Model.findByIdAndUpdate.mockResolvedValue({ _id: "1" });

      const result = await repository.update("1", { name: "new" });

      expect(Model.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        { name: "new" },
        {}
      );
      expect(result).toEqual({ _id: "1" });
    });

    it("passes the session as an option", async () => {
      Model.findByIdAndUpdate.mockResolvedValue(null);
      const session = { id: "session" };

      await repository.update("1", { name: "new" }, { session });

      expect(Model.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        { name: "new" },
        { session }
      );
    });
  });

  describe("findOneAndUpdate", () => {
    it("forwards the filter, update and session options", async () => {
      Model.findOneAndUpdate.mockResolvedValue({ _id: "1" });
      const session = { id: "session" };

      const result = await repository.findOneAndUpdate(
        { email: "a@b.com" },
        { name: "new" },
        { session }
      );

      expect(Model.findOneAndUpdate).toHaveBeenCalledWith(
        { email: "a@b.com" },
        { name: "new" },
        { session }
      );
      expect(result).toEqual({ _id: "1" });
    });

    it("uses empty options when no session is given", async () => {
      Model.findOneAndUpdate.mockResolvedValue(null);

      await repository.findOneAndUpdate({ email: "a@b.com" }, { name: "new" });

      expect(Model.findOneAndUpdate).toHaveBeenCalledWith(
        { email: "a@b.com" },
        { name: "new" },
        {}
      );
    });
  });

  describe("delete", () => {
    it("hard deletes by id", async () => {
      Model.findByIdAndDelete.mockResolvedValue({ _id: "1" });

      const result = await repository.delete("1");

      expect(Model.findByIdAndDelete).toHaveBeenCalledWith("1", {});
      expect(result).toEqual({ _id: "1" });
    });

    it("hard deletes by id within a session", async () => {
      Model.findByIdAndDelete.mockResolvedValue(null);
      const session = { id: "session" };

      await repository.delete("1", { session });

      expect(Model.findByIdAndDelete).toHaveBeenCalledWith("1", { session });
    });
  });

  describe("mark_deleted", () => {
    it("soft deletes by setting isDeleted", async () => {
      Model.findByIdAndUpdate.mockResolvedValue({ isDeleted: true });

      const result = await repository.mark_deleted("1");

      expect(Model.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        { isDeleted: true },
        {}
      );
      expect(result).toEqual({ isDeleted: true });
    });

    it("soft deletes within a session", async () => {
      Model.findByIdAndUpdate.mockResolvedValue(null);
      const session = { id: "session" };

      await repository.mark_deleted("1", { session });

      expect(Model.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        { isDeleted: true },
        { session }
      );
    });
  });
});
