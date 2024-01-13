const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");

jest.mock("../../../../services/UserToken", () => ({
  fetchTokenFromId: jest.fn()
}));
const UserTokenService = require("../../../../services/UserToken");
const UserToken = require("../../../../models/UserToken");

describe("GET /reset-password", () => {
  beforeAll(() => {
    process.env.CLIENT_URL = "https://clienturl.com";
    process.env.JWT_SECRET = "mysecret";
  });
  afterAll(() => {
    delete process.env.CLIENT_URL;
    delete process.env.JWT_SECRET;
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

  it("403 - User Token is expired", async () => {
    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => new UserToken({
      createdAt: new Date("01-01-2001"),
      expireAt: new Date("01-01-2001"),
      token: "123",
      type: "FORGOT",
      userId: "12342",
      userTokenId: "241254",
    }));

    const response = await request(app).get("/auth/reset-password").query({ token: "1235" });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: STATUS_CODES[403],
      message: "User Token is expired",
      statusCode: 403
    });
  });

  it("302 - User Token is valid", async () => {
    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => new UserToken({
      createdAt: new Date("01-01-2001"),
      expireAt: new Date("02-01-20075"),
      token: "123",
      type: "FORGOT",
      userId: "12342",
      userTokenId: "241254",
    }));

    const response = await request(app).get("/auth/reset-password").query({ token: "1235" });

    expect(response.status).toBe(302);
    expect(response.header.location).toBe("https://clienturl.com/reset-password?token=123");
    expect(response.header["set-cookie"][0]).toMatch(/resetPasswordSession=/);
  });

  it("500 - Unexpected errors", async () => {
    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => {throw new Error("Unexpected error");});

    const response = await request(app).get("/auth/reset-password").query({ token: "1235" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Unexpected error",
      statusCode: 500
    });
  });
});
