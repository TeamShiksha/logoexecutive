const { createKey, fetchKeysByuserid, isAPIKeyPresent, destroyKey, fetchUserByApiKey } = require("../../../services");
const Keys = require("../../../models/Keys");
const { mockKeys } = require("../../../utils/mocks/Keys");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongo_uri = mongoServer.getUri();
  await mongoose.connect(mongo_uri);
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
    // expect(result).toBeInstanceOf(Keys);
    expect(result.user).toBe(mockKeys[0].user);
    expect(result.keyDescription).toBe(mockKeys[0].keyDescription);
    expect(result.key).toMatch(/^[A-F0-9]{32}$/);
  });

  test("should return null if the key creation result is falsy", async () => {
    jest.spyOn(Keys.prototype, "save").mockResolvedValueOnce(null);
    const data = { user: "some-user-id", keyDescription: "API Key for service X" };
    const result = await createKey(data);

    expect(result).toBeNull();
  });

  test("should throw an error if database operation fails", async () => {
    const errorMessage = "Database operation failed";
    jest.spyOn(Keys.prototype, "save").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await expect(createKey(mockKeys[0])).rejects.toThrow(errorMessage);
  });
});

describe("fetchKeysByuserid", () => {
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
    // expect(result[0]).toBeInstanceOf(Keys);
  });

  test("should not include 'key' property in returned keys", async () => {
    const result = await fetchKeysByuserid(mockKeys[0].user);
    // Assert that 'key' property is absent in each object of the result
    expect(result.every((keyObj) => !keyObj.hasOwnProperty("key"))).toBe(true);
  });

  test("should return null if no keys are found for the provided userId", async () => {
    const nonExistingUser = new mongoose.Types.ObjectId();
    const result = await fetchKeysByuserid(nonExistingUser);
    expect(result).toBeNull();
  });

  test("should throw an error if the database operation fails", async () => {
    const errorMessage = "Database operation failed";

    jest.spyOn(Keys, "find").mockRejectedValueOnce(new Error(errorMessage));
    await expect(fetchKeysByuserid(mockKeys[0].user)).rejects.toThrow(
      errorMessage,
    );
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
    const mockApiKey = "NON_EXISTING_KEY";
    const result = await isAPIKeyPresent(mockApiKey);
    expect(result).toBe(false);
  });

  test("should throw an error if an error occurs while checking API key presence", async () => {
    const errorMessage = "MongoDB operation failed";
    jest.spyOn(Keys, "find").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await expect(isAPIKeyPresent("some-api-key")).rejects.toThrow(errorMessage);
  });
});

describe("fetchUserByApiKey", () => {
  beforeEach(async () => {
    await Keys.insertMany(mockKeys);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await Keys.deleteMany({});
  });

  test("should return the user associated with the provided API key", async () => {
    const result = await fetchUserByApiKey(mockKeys[0].key);
    expect(result).toBe(mockKeys[0].user.toString());
  });

  test("should return null if the API key does not exist", async () => {
    const mockApiKey = "NON_EXISTING_KEY";
    const result = await fetchUserByApiKey(mockApiKey);
    expect(result).toBeNull();
  });

  test("should throw an error if the database operation fails", async () => {
    const errorMessage = "Database operation failed";

    jest.spyOn(Keys, "findOne").mockRejectedValueOnce(new Error(errorMessage));
    await expect(fetchUserByApiKey(mockKeys[0].key)).rejects.toThrow(errorMessage);
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
    const result = await destroyKey(createdKey.keyId);
    expect(result).toBe(true);
    const deletedKey = await Keys.findById(createdKey.keyId);
    expect(deletedKey).toBeNull();
  });

  test("should throw an error when no key is deleted (deletedCount is 0)", async () => {
    jest.spyOn(Keys, "deleteOne").mockResolvedValueOnce({ deletedCount: 0 });

    await expect(destroyKey("non-existent-id")).rejects.toThrow("Database operation failed");
  });

  test("should throw an error if the delete operation fails", async () => {
    const errorMessage = "Database operation failed";

    jest
      .spyOn(Keys, "deleteOne")
      .mockRejectedValueOnce(new Error(errorMessage));

    await expect(destroyKey(createdKey._id)).rejects.toThrow(errorMessage);
  });
});
