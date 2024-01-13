const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");

jest.mock("../../../../services/UserToken", () => ({
  deleteUserToken: jest.fn().mockImplementation(
    () => new Promise((resolve) => resolve({ success: true })),
  ),
  fetchTokenFromId: jest.fn(),
}));
const UserTokenService = require("../../../../services/UserToken");
jest.mock("../../../../services/User", () => ({
  fetchUserFromId: jest.fn(),
  verifyUser: jest.fn(),
}));
const UserService = require("../../../../services/User");

const { mockUserTokens } = require("../../../../utils/mocks/UserToken");
const UserToken = require("../../../../models/UserToken");
const { mockUsers } = require("../../../../utils/mocks/Users");
const User = require("../../../../models/Users");

const mockUserModel = new User(mockUsers[0]);
const mockUserTokenVerify = new UserToken(mockUserTokens[0]);

describe("GET /auth/verify", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("422 - token is not present", async () => {
    const response = await request(app).get("/auth/verify");

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "No token provided",
      statusCode: 422,
    });
  });

  it("400 - token does not exist", async () => {
    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => null);

    const response = await request(app)
      .get("/auth/verify")
      .query({ token: "token" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: STATUS_CODES[400],
      message: "Token does not exists",
      statusCode: 400,
    });
  });

  it("403 - token is expired", async () => {
    // create a copy of mockusertoken
    const mockUserToken = new UserToken({
      ...mockUserTokenVerify,
      expireAt: Date.now(),
    });

    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => mockUserToken);

    const response = await request(app)
      .get("/auth/verify")
      .query({ token: "token" });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: STATUS_CODES[403],
      message: "User token expired",
      statusCode: 403,
    });
  });

  it("400 - User does not exist", async () => {
    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => mockUserTokenVerify);
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(() => null);

    const response = await request(app)
      .get("/auth/verify")
      .query({ token: "token" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: STATUS_CODES[400],
      message: "User no longer exists",
      statusCode: 400,
    });
  });

  it("500 - Verify service fails", async () => {
    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => mockUserTokenVerify);
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(() => mockUserModel);
    jest.spyOn(UserService, "verifyUser").mockImplementation(() => ({
      success: false,
      message: "Failed to verify user",
    }));

    const response = await request(app)
      .get("/auth/verify")
      .query({ token: "token" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Failed to verify user",
      statusCode: 500,
    });
  });

  it("Success 200 - User is verified", async () => {
    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => mockUserTokenVerify);
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(() => mockUserModel);
    jest.spyOn(UserService, "verifyUser").mockImplementation(() => ({ success: true }));

    const response = await request(app)
      .get("/auth/verify")
      .query({ token: "token" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "User verified successfully",
    });
  });

  it("Error 500 - response from error handler", async () => {
    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => {throw new Error("Unexpected error");});

    const response = await request(app)
      .get("/auth/verify")
      .query({ token: "token" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Unexpected error",
      statusCode: 500,
    });
  });
});
