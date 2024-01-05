const request = require("supertest");
const app = require("../../../app");

const resetPasswordPayload = {
  newPassword: "@Rtyu678KMh",
  confirmPassword: "@Rtyu678KMh",
  userId: "123",
};

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
  fetchTokenFromUserid: jest.fn(),
  deleteUserToken: jest.fn(),
}));

const userService = require("../../../services/User");
const userTokenService = require("../../../services/UserToken");
const { mockUserModel } = require("../../../utils/mocks/Users");

describe("resetPassword controller", () => {
  beforeAll(() => {
    process.env.BASE_URL = "https://example.com";
  });
  afterAll(() => {
    delete process.env.BASE_URL;
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it("should reset the existing password", async () => {
    jest
      .spyOn(userService, "fetchUserFromId")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userService, "updatePasswordService")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(userTokenService, "fetchTokenFromUserid")
      .mockImplementation(() => userTokenObj);
    jest
      .spyOn(userTokenService, "deleteUserToken")
      .mockImplementation(() => userTokenObj);
    const response = await request(app)
      .patch("/auth/reset-password")
      .send(resetPasswordPayload);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Password updated Successfully" });
  });
});