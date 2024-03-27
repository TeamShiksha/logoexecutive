const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");
const { Users, UserToken} = require("../../../../models");
const { mockUserTokens } = require("../../../../utils/mocks/UserToken");
const { UserTokenService, UserService } = require("../../../../services");

jest.mock("../../../../services/UserToken", () => ({
  fetchTokenFromId: jest.fn(),
  deleteUserToken: jest.fn(),
}));
jest.mock("../../../../services/Users", () => ({
  fetchUserFromId: jest.fn(),
  updatePasswordService: jest.fn(),
}));

const ENDPOINT = "/api/auth/reset-password";

describe("GET /auth/reset-password", () => {

  beforeAll(() => {
    process.env.BASE_URL = "https://clienturl.com";
    process.env.JWT_SECRET = "mysecret";
  });
  afterAll(() => {
    delete process.env.BASE_URL;
    delete process.env.JWT_SECRET;
  });

  it("500 - CORS", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500], message: "Not allowed by CORS",
      statusCode: 500
    });
  });

  it("422 - token missing", async () => {
    const response = await request(app).get(ENDPOINT);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "\"token\" is required",
      statusCode: 422
    });
  });

  it("404 - User Token not found", async () => {
    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => null);

    const response = await request(app).get(ENDPOINT).query({ token: "1235" });

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

    const response = await request(app).get(ENDPOINT).query({ token: "1235" });
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

    const response = await request(app).get(ENDPOINT).query({ token: "1235" });

    expect(response.status).toBe(302);
    expect(response.header.location).toBe("https://clienturl.com/reset-password?token=123");
    expect(response.header["set-cookie"][0]).toMatch(/resetPasswordSession=/);
  });

  it("500 - Unexpected errors", async () => {
    jest.spyOn(UserTokenService, "fetchTokenFromId").mockImplementation(() => {throw new Error("Unexpected error");});

    const response = await request(app).get(ENDPOINT).query({ token: "1235" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Unexpected error",
      statusCode: 500
    });
  });
});

describe("PATCH /auth/reset-password", () => {
  const ENDPOINT = "/api/auth/reset-password";

  const resetPasswordPayload = {
    newPassword: "@Rtyu678KMh",
    confirmPassword: "@Rtyu678KMh",
    token: mockUserTokens[2].token,
  };

  const mockUserModel = new Users(mockUserTokens[0]);

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
      .spyOn(UserService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(UserService, "updatePasswordService")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(UserTokenService, "fetchTokenFromId")
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
      .spyOn(UserService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(UserService, "updatePasswordService")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(UserTokenService, "fetchTokenFromId")
      .mockImplementation(() => new UserToken(mockUserTokens[2]));
    jest
      .spyOn(UserTokenService, "deleteUserToken")
      .mockImplementation(() => new UserToken(mockUserTokens[2]));

    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `resetPasswordSession=${mockToken}`)
      .send(resetPasswordPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Your password has been updated successfully." });
  });
});
