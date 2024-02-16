const request = require("supertest");
const app = require("../../../../app");
const userService = require("../../../../services/User");
const userTokenService = require("../../../../services/UserToken");
const { mockUsers } = require("../../../../utils/mocks/Users");
const User = require("../../../../models/Users");
const { STATUS_CODES } = require("http");
const UserToken = require("../../../../models/UserToken");
const { mockUserTokens } = require("../../../../utils/mocks/UserToken");

const resetPasswordPayload = {
  newPassword: "@Rtyu678KMh",
  confirmPassword: "@Rtyu678KMh",
  token: mockUserTokens[2].token,
};

const ENDPOINT = "/api/auth/reset-password";

const mockUserModel = new User(mockUsers[0]);

jest.mock("../../../../services/User", () => ({
  fetchUserFromId: jest.fn(),
  updatePasswordService: jest.fn(),
}));

jest.mock("../../../../services/UserToken", () => ({
  fetchTokenFromId: jest.fn(),
  deleteUserToken: jest.fn(),
}));

describe("PATCH /auth/reset-password", () => {
  beforeAll(() => {
    process.env.BASE_URL = "https://example.com";
    process.env.JWT_SECRET = "my_secret";
  });

  afterAll(() => {
    delete process.env.BASE_URL;
    delete process.env.JWT_SECRET;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("500 - CORS", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500
    });
  });

  it("401 - Unauthorized error when cookie is not present", async () => {
    const response = await request(app)
      .patch(ENDPOINT)
      .send(resetPasswordPayload);

    expect(response.status).toBe(401);
  });

  it("422 - token is required", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockBody = {
      newPassword: "@Rtyu678KMh",
      confirmPassword: "@Rtyu678KMh",
    };

    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `resetPasswordSession=${mockToken}`)
      .send(mockBody);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "\"token\" is required",
      statusCode: 422
    });
  });

  it("422 - newPassword is required", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockBody = {
      token: "6dc1ff1a95e04dcdb347269ed15575bc",
      confirmPassword: "@Rtyu678KMh",
    };

    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `resetPasswordSession=${mockToken}`)
      .send(mockBody);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "\"newPassword\" is required",
      statusCode: 422
    });
  });

  it("422 - confirmPassword is required", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockBody = {
      token: "6dc1ff1a95e04dcdb347269ed15575bc",
      newPassword: "@Rtyu678KMh",
    };

    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `resetPasswordSession=${mockToken}`)
      .send(mockBody);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "\"confirmPassword\" is required",
      statusCode: 422
    });
  });

  it("403 - token mismatch", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockBody = {
      newPassword: "@Rtyu678KMh",
      confirmPassword: "@Rtyu678KMh",
      token: "6dc1ff1a95e04dcdb847269ed15575fg",
    };

    jest
      .spyOn(userService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userService, "updatePasswordService")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userTokenService, "fetchTokenFromId")
      .mockImplementation(() => new UserToken(mockUserTokens[2]));
    jest
      .spyOn(userTokenService, "deleteUserToken")
      .mockImplementation(() => new UserToken(mockUserTokens[2]));

    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `resetPasswordSession=${mockToken}`)
      .send(mockBody);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "Forbidden",
      message: "Invalid credentials",
      statusCode: 403,
    });
  });

  it("200 - Success", async () => {
    const mockToken = mockUserModel.generateJWT();

    jest
      .spyOn(userService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userService, "updatePasswordService")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userTokenService, "fetchTokenFromId")
      .mockImplementation(() => new UserToken(mockUserTokens[2]));
    jest
      .spyOn(userTokenService, "deleteUserToken")
      .mockImplementation(() => new UserToken(mockUserTokens[2]));

    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `resetPasswordSession=${mockToken}`)
      .send(resetPasswordPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Password updated Successfully" });
  });
});
