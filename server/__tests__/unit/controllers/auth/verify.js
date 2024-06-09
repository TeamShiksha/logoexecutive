const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");

const { UserTokenService, UserService } = require("../../../../services");
const { mockUserTokens } = require("../../../../utils/mocks/UserToken");
const { UserToken, Users } = require("../../../../models");
const { mockUsers } = require("../../../../utils/mocks/Users");
const mockUserModel = new Users(mockUsers[0]);
const mockUserTokenVerify = new UserToken(mockUserTokens[0]);

jest.mock("../../../../services/UserToken", () => ({
  deleteUserToken: jest.fn(),
  fetchTokenFromId: jest.fn(),
}));
jest.mock("../../../../services/Users", () => ({
  fetchUserFromId: jest.fn(),
  verifyUser: jest.fn(),
}));

const ENDPOINT = "/api/auth/verify";

describe("GET /auth/verify", () => {
  beforeAll(() => {
    process.env.CLIENT_URL = "http://validcorsorigin.com";
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  afterAll(() => {
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

  it("422 - token is not present", async () => {
    const response = await request(app).get(ENDPOINT);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "No token provided",
      statusCode: 422,
    });
  });

  it("400 - token does not exist", async () => {
    jest
      .spyOn(UserTokenService, "fetchTokenFromId")
      .mockImplementation(() => null);
    const response = await request(app).get(ENDPOINT).query({ token: "token" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: STATUS_CODES[400],
      message: "Invalid token",
      statusCode: 400,
    });
  });

  it("403 - token is expired", async () => {
    const mockUserToken = new UserToken({
      ...mockUserTokenVerify,
      expireAt: Date.now(),
    });
    jest
      .spyOn(UserTokenService, "fetchTokenFromId")
      .mockImplementation(() => mockUserToken);

    const response = await request(app).get(ENDPOINT).query({ token: "token" });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: STATUS_CODES[403],
      message: "Token expired",
      statusCode: 403,
    });
  });

  it("400 - User does not exist", async () => {
    jest
      .spyOn(UserTokenService, "fetchTokenFromId")
      .mockImplementation(() => mockUserTokenVerify);
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(() => null);
    const response = await request(app).get(ENDPOINT).query({ token: "token" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: STATUS_CODES[404],
      message: "User doesn't exists",
      statusCode: 404,
    });
  });

  it("500 - Verify service fails", async () => {
    jest
      .spyOn(UserTokenService, "fetchTokenFromId")
      .mockImplementation(() => mockUserTokenVerify);
    jest
      .spyOn(UserService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest.spyOn(UserService, "verifyUser").mockImplementation(false);
    const response = await request(app).get(ENDPOINT).query({ token: "token" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Failed to verify user, try again",
      statusCode: 500,
    });
  });

  it("500 - Unexpected error", async () => {
    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => {
      throw new Error("Unexpected error");
    });
    const response = await request(app).get(ENDPOINT).query({ token: "token" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Unexpected error",
      error: STATUS_CODES[500],
      statusCode: 500,
    });
  });

  it("500 - Internal server error", async () => {
    jest
      .spyOn(UserTokenService, "fetchTokenFromId")
      .mockImplementation(() => mockUserTokenVerify);
    jest
      .spyOn(UserService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest.spyOn(UserService, "verifyUser").mockResolvedValueOnce(true);
    jest
      .spyOn(UserTokenService, "deleteUserToken")
      .mockResolvedValueOnce(false);
    const response = await request(app).get(ENDPOINT).query({ token: "token" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Something went wrong",
      statusCode: 500,
    });
  });

  it("200 - Verification successful", async () => {
    jest
      .spyOn(UserTokenService, "fetchTokenFromId")
      .mockImplementation(() => mockUserTokenVerify);
    jest
      .spyOn(UserService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest.spyOn(UserService, "verifyUser").mockResolvedValueOnce(true);
    jest.spyOn(UserTokenService, "deleteUserToken").mockResolvedValueOnce(true);
    const response = await request(app).get(ENDPOINT).query({ token: "token" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Verification successful",
    });
  });
});
