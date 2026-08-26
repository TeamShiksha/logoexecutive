const {
  ContactUsRepository,
  CreateLogoRequestRepository,
} = require("../../repositories");
const VerificationSessionRepository = require("../../repositories/verificationSession");

describe("ContactUsRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new ContactUsRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("finds a form by email and status", async () => {
    const findOne = jest
      .spyOn(repository.model, "findOne")
      .mockResolvedValue({ _id: "form-1" });

    const result = await repository.findByEmailAndStatus("a@b.com", "PENDING");

    expect(findOne).toHaveBeenCalledWith({
      email: "a@b.com",
      status: "PENDING",
    });
    expect(result).toEqual({ _id: "form-1" });
  });

  it("updates a form by id", async () => {
    const updateOne = jest
      .spyOn(repository.model, "updateOne")
      .mockResolvedValue({ modifiedCount: 1 });

    const result = await repository.updateFormStatus("form-1", {
      status: "RESOLVED",
    });

    expect(updateOne).toHaveBeenCalledWith(
      { _id: "form-1" },
      { status: "RESOLVED" }
    );
    expect(result).toEqual({ modifiedCount: 1 });
  });

  it("counts all forms", async () => {
    jest.spyOn(repository.model, "countDocuments").mockResolvedValue(3);

    expect(await repository.getFormsCount()).toBe(3);
  });
});

describe("CreateLogoRequestRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new CreateLogoRequestRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("finds a logo request by company url and status", async () => {
    const findOne = jest
      .spyOn(repository.model, "findOne")
      .mockResolvedValue(null);

    const result = await repository.findByCompanyUrlAndStatus(
      "https://openlogo.fyi",
      "PENDING"
    );

    expect(findOne).toHaveBeenCalledWith({
      companyUrl: "https://openlogo.fyi",
      status: "PENDING",
    });
    expect(result).toBeNull();
  });

  it("updates a logo request by id", async () => {
    const updateOne = jest
      .spyOn(repository.model, "updateOne")
      .mockResolvedValue({ modifiedCount: 1 });

    const result = await repository.updateLogoStatus("logo-1", {
      status: "COMPLETED",
    });

    expect(updateOne).toHaveBeenCalledWith(
      { _id: "logo-1" },
      { status: "COMPLETED" }
    );
    expect(result).toEqual({ modifiedCount: 1 });
  });
});

describe("VerificationSessionRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new VerificationSessionRepository();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("consumes an unused, unexpired session and returns it with the user", async () => {
    const populate = jest.fn().mockResolvedValue({ sessionId: "abc" });
    const findOneAndUpdate = jest
      .spyOn(repository.model, "findOneAndUpdate")
      .mockReturnValue({ populate });

    const result = await repository.findAndUpdateActiveSession({
      sessionType: "PASSWORD_RESET",
      sessionId: "abc",
    });

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      {
        sessionId: "abc",
        sessionType: "PASSWORD_RESET",
        usedAt: null,
        expiresAt: { $gt: new Date("2026-04-27T12:00:00.000Z") },
      },
      { $set: { usedAt: new Date("2026-04-27T12:00:00.000Z") } },
      { new: true }
    );
    expect(populate).toHaveBeenCalledWith("userId");
    expect(result).toEqual({ sessionId: "abc" });
  });
});
