const request = require("supertest");
const { STATUS_CODES } = require("http");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../../../app");
const { Users, ContactUs } = require("../../../models");
const { mockUsers } = require("../../../utils/mocks/Users");
const { fetchWithPagination, commonService } = require("../../../services");

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongo_uri = mongoServer.getUri();
  await mongoose.connect(mongo_uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("fetchWithPagination", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await ContactUs.deleteMany({});
  });

  test("should return reject if any query is missing", async () => {
    await expect(fetchWithPagination(1, 4)).rejects.toThrow(
      "This model is not compatible with pagination"
    );
  });

  test("should return true if all params is present", async () => {
    const expectedResult = {
      limit: 4,
      page: 1,
      pages: 0,
      results: [],
      total: 0,
    };
    await expect(
      fetchWithPagination("ContactUs", 1, 4, { activity: true })
    ).resolves.toEqual(expectedResult);
  });

  test("should return reject if model is not present", async () => {
    await expect(
      fetchWithPagination("", 1, 1, { activity: true })
    ).rejects.toThrow("This model is not compatible with pagination");
  });

  test("should throw error if no params are present", async () => {
    await expect(fetchWithPagination()).rejects.toThrow(
      "This model is not compatible with pagination"
    );
  });

  test("should throw error if no data is present", async () => {
    const result = await fetchWithPagination("ContactUs", 9, 9, {
      activity: false,
    });
    expect(result).toStrictEqual({
      limit: 9,
      page: 9,
      pages: 0,
      results: [],
      total: 0,
    });
  });
});
