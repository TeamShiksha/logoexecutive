const { createRaiseRequest } = require("../../../services");
const { RaiseRequest } = require("../../../models");
const { mockRaiseRequestForm } = require("../../../utils/mocks/raiseRequest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongo_uri = mongoServer.getUri();
  await mongoose.connect(mongo_uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("createRaiseRequest", () => {
  afterEach(async () => {
    await RaiseRequest.deleteMany({});
  });

  it("should create a form in database and return the created form object", async () => {
    const formData = {
      email: "prajwalchoudhary14@gmail.com",
      companyUrl: "https://google.com/",
    };
    const addedForm = await createRaiseRequest(formData);
    expect(addedForm).toBeInstanceOf(RaiseRequest);
  });

  it("should not create a form in database if form is incomplete", async () => {
    const formData = {
      companyUrl: "https://google.com/",
    };
    await expect(createRaiseRequest(formData)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it("should return null if MongoDB save operation fails", async () => {
    jest.spyOn(RaiseRequest.prototype, "save").mockImplementationOnce(() => {
      throw new Error("MongoDB operation failed");
    });

    const formData = {
      email: "prajwalchoudhary14@gmail.com",
      companyUrl: "https://www.google.com/",
    };

    await expect(createRaiseRequest(formData)).rejects.toThrow(
      "MongoDB operation failed"
    );
  });

  it("should return a RaiseRequest instance when mongoDB save operation returns", async () => {
    const formData = {
      email: "prajwalchoudhary14@gmail.com",
      companyUrl: "https://google.com",
    };
    const result = await createRaiseRequest(formData);
    expect(result).toBeInstanceOf(RaiseRequest);
    expect(result.email).toEqual(formData.email);
    expect(result.companyUrl).toEqual(formData.companyUrl);
  });
});
