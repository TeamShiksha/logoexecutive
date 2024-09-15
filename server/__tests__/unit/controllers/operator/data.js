const request = require("supertest");
const { STATUS_CODES } = require("http");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../../../../app");
const { Users } = require("../../../../models");
const { mockUsers } = require("../../../../utils/mocks/Users");
const commonService = require("../../../../services");
const { UserType } = require("../../../../utils/constants");

const mockOperator = new Users(
  mockUsers.find((item) => item.userType === UserType.OPERATOR),
);

jest.mock("../../../../services/Users", () => ({
  fetchUserFromId: jest.fn(),
}));

const ENDPOINT = "/api/common/pagination";

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongo_uri = mongoServer.getUri();
  await mongoose.connect(mongo_uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /common/pagination", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "mysecret";
    process.env.CLIENT_PROXY_URL = "http://example.com";
    process.env.CLIENT_URL = "http://example.com";
  });
  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_PROXY_URL;
    delete process.env.CLIENT_URL;
  });

  it("500 - Not allowed by CORS", async () => {
    const response = await request(app)
      .get(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("401 - User not signed in", async () => {
    const response = await request(app).get(ENDPOINT);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Unauthorized",
      message: "User not signed in",
      statusCode: 401,
    });
  });

  it("401 - Unauthorized", async () => {
    const queryParams = {
      page: 1,
      limit: 3,
      active: true
    };
    jest
      .spyOn(commonService, "fetchWithPagination")
      .mockImplementation(() => queryParams);
    const response = await request(app).get(ENDPOINT).query(queryParams);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: STATUS_CODES[401],
      message: "User not signed in",
      statusCode: 401,
    });
  });

  it("200 - Successful", async () => {
    const mockJWT = mockOperator.generateJWT();

    jest
      .spyOn(commonService, "fetchWithPagination")
      .mockImplementation(() => ({
        limit: 1,
        page: 1,
        pages: 1,
        results: [],
        total: 0,
      }));

    const response = await request(app).get(`${ENDPOINT}?type=queries&page=1&limit=1&active=true`)
      .set("Cookie", `jwt=${mockJWT}`);

    console.log(response.body); // For debugging

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Successful",
      statusCode: 200,
      pages: 0,
      results: [],
      total: 0
    });
  }, 10000);

});
