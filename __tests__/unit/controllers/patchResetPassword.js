const request = require("supertest");
const app = require("../../../app");
const userService = require("../../../services/User");
const userTokenService = require("../../../services/UserToken");
const { mockUsers } = require("../../../utils/mocks/Users");
const User = require("../../../models/Users");

const resetPasswordPayload = {
  newPassword: "@Rtyu678KMh",
  confirmPassword: "@Rtyu678KMh",
  token: "6dc1ff1a95e04dcdb347269ed15575bc",
};

const mockUserModel = new User(mockUsers[0]);

const userTokenObj = {
  createdAt: "29 December 2023 at 17:04:18 UTC+5:30",
  expireAt: "30 December 2023 at 17:04:18 UTC+5:30",
  token: "6dc1ff1a95e04dcdb347269ed15575bc",
  type: "VERIFY",
  userId: "123",
  userTokenId: "069290e9-a26d-4211-8753-881ed5067399",
};

jest.mock("../../../services/User", () => ({
  fetchUserFromId: jest.fn(),
  updatePasswordService: jest.fn(),
}));

jest.mock("../../../services/UserToken", () => ({
  fetchTokenFromId: jest.fn(),
  deleteUserToken: jest.fn(),
}));

describe("resetPassword controller", () => {
  beforeAll(() => {
    process.env.BASE_URL = "https://example.com";
    process.env.JWT_SECRET = "my_secret";
  });
  afterAll(() => {
    delete process.env.BASE_URL;
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it("should reset the existing password", async () => {
    const mockToken = mockUserModel.generateJWT();

    jest
      .spyOn(userService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userService, "updatePasswordService")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userTokenService, "fetchTokenFromId")
      .mockImplementation(() => userTokenObj);
    jest
      .spyOn(userTokenService, "deleteUserToken")
      .mockImplementation(() => userTokenObj);

    const response = await request(app)
      .patch("/auth/reset-password")
      .set("cookie", `resetPasswordSession=${mockToken}`)
      .send(resetPasswordPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Password updated Successfully" });
  });

  it("should throw 401 Unauthorized error when cookie is not present", async () => {
    jest
      .spyOn(userService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userService, "updatePasswordService")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userTokenService, "fetchTokenFromId")
      .mockImplementation(() => userTokenObj);
    jest
      .spyOn(userTokenService, "deleteUserToken")
      .mockImplementation(() => userTokenObj);

    const response = await request(app)
      .patch("/auth/reset-password")
      .send(resetPasswordPayload);

    expect(response.status).toBe(401);
  });

  it("it should throw 402 error if token is missing from body", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockBody = {
      newPassword: "@Rtyu678KMh",
      confirmPassword: "@Rtyu678KMh",
    };

    jest
      .spyOn(userService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userService, "updatePasswordService")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userTokenService, "fetchTokenFromId")
      .mockImplementation(() => userTokenObj);
    jest
      .spyOn(userTokenService, "deleteUserToken")
      .mockImplementation(() => userTokenObj);

    const response = await request(app)
      .patch("/auth/reset-password")
      .set("cookie", `resetPasswordSession=${mockToken}`)
      .send(mockBody);

    expect(response.status).toBe(402);
    expect(response.body).toEqual({ message: "\"token\" is required" });
  });

  it("should throw error 402 if new password is missing from body", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockBody = {
      token: "6dc1ff1a95e04dcdb347269ed15575bc",
      confirmPassword: "@Rtyu678KMh",
    };

    jest
      .spyOn(userService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userService, "updatePasswordService")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userTokenService, "fetchTokenFromId")
      .mockImplementation(() => userTokenObj);
    jest
      .spyOn(userTokenService, "deleteUserToken")
      .mockImplementation(() => userTokenObj);

    const response = await request(app)
      .patch("/auth/reset-password")
      .set("cookie", `resetPasswordSession=${mockToken}`)
      .send(mockBody);

    expect(response.status).toBe(402);
    expect(response.body).toEqual({ message: "\"newPassword\" is required" });
  });
  it("should throw error 402 if confirm password is missing from body", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockBody = {
      token: "6dc1ff1a95e04dcdb347269ed15575bc",
      newPassword: "@Rtyu678KMh",
    };

    jest
      .spyOn(userService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userService, "updatePasswordService")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userTokenService, "fetchTokenFromId")
      .mockImplementation(() => userTokenObj);
    jest
      .spyOn(userTokenService, "deleteUserToken")
      .mockImplementation(() => userTokenObj);

    const response = await request(app)
      .patch("/auth/reset-password")
      .set("cookie", `resetPasswordSession=${mockToken}`)
      .send(mockBody);

    expect(response.status).toBe(402);
    expect(response.body).toEqual({ message: "\"confirmPassword\" is required" });
  });

  it("should throw error 403 if the token is mismatch", async () => {
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
      .mockImplementation(() => userTokenObj);
    jest
      .spyOn(userTokenService, "deleteUserToken")
      .mockImplementation(() => userTokenObj);

    const response = await request(app)
      .patch("/auth/reset-password")
      .set("cookie", `resetPasswordSession=${mockToken}`)
      .send(mockBody);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "Forbidden",
      message: "Invalid credentials",
      statusCode: 403,
    });
  });
});
