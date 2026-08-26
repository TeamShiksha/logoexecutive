const { MilestoneConfigRepository } = require("../../repositories");

const createLeanQueryMock = (result) => {
  const query = {};
  query.session = jest.fn().mockReturnValue(query);
  query.sort = jest.fn().mockReturnValue(query);
  query.lean = jest.fn().mockResolvedValue(result);
  return query;
};

describe("MilestoneConfigRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new MilestoneConfigRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("findActive", () => {
    it("returns the active, non-deleted config as a lean object", async () => {
      const query = createLeanQueryMock({ _id: "config-1" });
      const findOne = jest
        .spyOn(repository.model, "findOne")
        .mockReturnValue(query);

      const result = await repository.findActive();

      expect(findOne).toHaveBeenCalledWith({
        is_active: true,
        is_deleted: false,
      });
      expect(query.session).not.toHaveBeenCalled();
      expect(result).toEqual({ _id: "config-1" });
    });

    it("binds the provided session", async () => {
      const query = createLeanQueryMock(null);
      jest.spyOn(repository.model, "findOne").mockReturnValue(query);
      const session = { id: "session" };

      await repository.findActive({ session });

      expect(query.session).toHaveBeenCalledWith(session);
    });
  });

  describe("findAll", () => {
    it("returns non-deleted configs with the active one first", async () => {
      const query = createLeanQueryMock([{ _id: "config-1" }]);
      const find = jest.spyOn(repository.model, "find").mockReturnValue(query);

      const result = await repository.findAll();

      expect(find).toHaveBeenCalledWith({ is_deleted: false });
      expect(query.sort).toHaveBeenCalledWith({
        is_active: -1,
        createdAt: -1,
      });
      expect(result).toEqual([{ _id: "config-1" }]);
    });
  });

  describe("findById", () => {
    it("ignores soft-deleted configs", async () => {
      const query = createLeanQueryMock(null);
      const findOne = jest
        .spyOn(repository.model, "findOne")
        .mockReturnValue(query);

      const result = await repository.findById("config-1");

      expect(findOne).toHaveBeenCalledWith({
        _id: "config-1",
        is_deleted: false,
      });
      expect(result).toBeNull();
    });
  });

  describe("activateConfig", () => {
    it("deactivates every config and activates the target in one transaction", async () => {
      const session = {
        withTransaction: jest.fn((callback) => callback()),
      };
      jest.spyOn(repository.model, "startSession").mockResolvedValue(session);
      const updateMany = jest
        .spyOn(repository.model, "updateMany")
        .mockResolvedValue({ modifiedCount: 2 });
      const findOneAndUpdate = jest
        .spyOn(repository.model, "findOneAndUpdate")
        .mockResolvedValue({ _id: "config-1", is_active: true });

      const result = await repository.activateConfig("config-1");

      expect(session.withTransaction).toHaveBeenCalledTimes(1);
      expect(updateMany).toHaveBeenCalledWith(
        { is_deleted: false },
        { $set: { is_active: false } },
        { session }
      );
      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "config-1", is_deleted: false },
        { $set: { is_active: true } },
        { new: true, runValidators: true, session }
      );
      expect(result).toEqual({ _id: "config-1", is_active: true });
    });

    it("propagates transaction failures", async () => {
      const session = {
        withTransaction: jest.fn().mockRejectedValue(new Error("aborted")),
      };
      jest.spyOn(repository.model, "startSession").mockResolvedValue(session);

      await expect(repository.activateConfig("config-1")).rejects.toThrow(
        "aborted"
      );
    });
  });

  describe("updateInactive", () => {
    it("only updates configs that are inactive and not deleted", async () => {
      const findOneAndUpdate = jest
        .spyOn(repository.model, "findOneAndUpdate")
        .mockResolvedValue({ _id: "config-1" });

      const result = await repository.updateInactive("config-1", {
        name: "new",
      });

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "config-1", is_active: false, is_deleted: false },
        { $set: { name: "new" } },
        { new: true, runValidators: true }
      );
      expect(result).toEqual({ _id: "config-1" });
    });
  });

  describe("softDelete", () => {
    it("marks an inactive config as deleted", async () => {
      const findOneAndUpdate = jest
        .spyOn(repository.model, "findOneAndUpdate")
        .mockResolvedValue({ is_deleted: true });

      const result = await repository.softDelete("config-1");

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "config-1", is_active: false, is_deleted: false },
        { $set: { is_deleted: true } },
        { new: true }
      );
      expect(result).toEqual({ is_deleted: true });
    });
  });
});
