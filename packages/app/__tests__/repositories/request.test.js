const { RequestRepository } = require("../../repositories");

describe("RequestRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new RequestRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("findByUserAndStatus", () => {
    it("looks up a request by user and status", async () => {
      const findOne = jest
        .spyOn(repository.model, "findOne")
        .mockResolvedValue({ _id: "request-1" });

      const result = await repository.findByUserAndStatus("user-1", "PENDING");

      expect(findOne).toHaveBeenCalledWith({
        user_id: "user-1",
        status: "PENDING",
      });
      expect(result).toEqual({ _id: "request-1" });
    });
  });

  describe("findByCompanyUrlAndStatus", () => {
    it("looks up a request by company url and status", async () => {
      const findOne = jest
        .spyOn(repository.model, "findOne")
        .mockResolvedValue(null);

      const result = await repository.findByCompanyUrlAndStatus(
        "https://openlogo.fyi",
        "RESOLVED"
      );

      expect(findOne).toHaveBeenCalledWith({
        companyUrl: "https://openlogo.fyi",
        status: "RESOLVED",
      });
      expect(result).toBeNull();
    });
  });

  describe("getRequestsCount", () => {
    it("counts all requests", async () => {
      const countDocuments = jest
        .spyOn(repository.model, "countDocuments")
        .mockResolvedValue(9);

      const result = await repository.getRequestsCount();

      expect(countDocuments).toHaveBeenCalledWith();
      expect(result).toBe(9);
    });
  });

  describe("updateRequestStatus", () => {
    it("updates the request identified by id", async () => {
      const updateOne = jest
        .spyOn(repository.model, "updateOne")
        .mockResolvedValue({ modifiedCount: 1 });

      const result = await repository.updateRequestStatus("request-1", {
        status: "RESOLVED",
      });

      expect(updateOne).toHaveBeenCalledWith(
        { _id: "request-1" },
        { status: "RESOLVED" }
      );
      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe("getHitsCount", () => {
    it("counts only resolved requests", async () => {
      const countDocuments = jest
        .spyOn(repository.model, "countDocuments")
        .mockResolvedValue(4);

      const result = await repository.getHitsCount();

      expect(countDocuments).toHaveBeenCalledWith({ status: "RESOLVED" });
      expect(result).toBe(4);
    });
  });
});
