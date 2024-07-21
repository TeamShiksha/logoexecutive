const { createKey, fetchKeysByuserid, isAPIKeyPresent, destroyKey } = require("../../../services");
const Keys = require("../../../models/Keys");
const { mockKeys } = require("../../../utils/mocks/Keys");
const mongoose = require("mongoose");
require("dotenv").config();

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("createKey", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Keys.deleteMany({});
  });

  test("should create a key in the database and return the created key object", async () => {
    const result = await createKey(mockKeys[0]);
    expect(result).toBeInstanceOf(Keys);
    expect(result.user).toBe(mockKeys[0].user);
    expect(result.keyDescription).toBe(mockKeys[0].keyDescription);
    expect(result.key).toMatch(/^[A-F0-9]{32}$/);
    expect(result.usageCount).toBe(0);
  });

  test("should throw an error if database operation fails", async () => {
    const errorMessage = "Database operation failed";
    jest.spyOn(Keys.prototype, "save").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });
    
    await expect(createKey(mockKeys[0])).rejects.toThrow(errorMessage);
  });
});

describe("fetchKeysByUserId", () => {
  beforeEach(async () => {
    await Keys.insertMany(mockKeys);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await Keys.deleteMany({});
  });

  test("should fetch keys by userId from the key collection", async () => {
    const result = await fetchKeysByuserid(mockKeys[0].user);
    expect(result.length).toBe(mockKeys.length);
    expect(result[0]).toBeInstanceOf(Keys);
  });

  test("should return null if no keys are found for the provided userId", async () => {
    const nonExistingUser = new mongoose.Types.ObjectId("21FB95E0E988B2F5883106C0");
    const result = await fetchKeysByuserid(nonExistingUser);
    expect(result).toBeNull();
  });

  test("should throw an error if the database operation fails", async () => {
    const errorMessage = "Database operation failed";

    jest.spyOn(Keys, "find").mockRejectedValueOnce(new Error(errorMessage));
    await expect(fetchKeysByuserid(mockKeys[0].user)).rejects.toThrow(errorMessage);
  });
});

describe("isAPIKeyPresent", () => {
  beforeEach(async () => {
    await Keys.insertMany(mockKeys);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await Keys.deleteMany({});
  });

  test("should return true if the API key exists in the key collection", async () => {
    const result = await isAPIKeyPresent(mockKeys[0].key);
    expect(result).toBe(true);
  });

  test("should return false if the API key does not exist in the key collection", async () => {
    const mockApiKey = "mockApiKey";
    const result = await isAPIKeyPresent(mockApiKey);
    expect(result).toBe(false);
  });
});

describe("destroyKey", () => {
  let createdKey;

  beforeEach(async () => {
    createdKey = await createKey(mockKeys[0]);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await Keys.deleteMany({});
  });

  test("should delete the key by keyId from the key collection", async () => {
    const result = await destroyKey(createdKey._id);
    expect(result).toBe(true);
    const deletedKey = await Keys.findById(createdKey._id);
    expect(deletedKey).toBeNull();
  });

  test("should throw an error if the delete operation fails", async () => {
    const errorMessage = "Database operation failed";

    jest.spyOn(Keys, "deleteOne").mockRejectedValueOnce(new Error(errorMessage));

    await expect(destroyKey(createdKey._id)).rejects.toThrow(errorMessage);
  });
});
