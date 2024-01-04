const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");

jest.mock("../../../../services/UserToken", () => ({
  fetchTokenFromId: jest.fn()
}));
const UserTokenService = require("../../../../services/UserToken");

describe("GET /reset-password", () => {
  beforeAll(() => {
    process.env.CLIENT_URL = "https://clienturl.com";
  });
  afterAll(() => {
    delete process.env.CLIENT_URL;
  });

  it("422 - token missing", async () => {
    const response = await request(app).get("/auth/reset-password");

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "\"token\" is required",
      statusCode: 422
    });
  });

  it("404 - User Token not found", async () => {
    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => null);

    const response = await request(app).get("/auth/reset-password").query({ token: "1235" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: STATUS_CODES[404],
      message: "User Token not found",
      statusCode: 404
    });
  });

  it("403 - User Token is expired", async () => {});
});
