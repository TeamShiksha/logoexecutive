const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");

const { Users } = require("../../../../models");
const { mockUsers } = require("../../../../utils/mocks/Users");
const { UserService } = require("../../../../services");

const mockUserModel = new Users(mockUsers[0]);
jest.mock("../../../../services/Users", () => ({
  fetchUserByEmail: jest.fn(),
  updatePasswordbyUser: jest.fn(),
}));
const ENDPOINT = "/api/user/update-password";

describe("POST - /user/update-password", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
    process.env.CLIENT_PROXY_URL = "http://validcorsorigin.com";
  });
  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_PROXY_URL;
  });

  it("500 - Not allowed by CORS", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("422 - Password and confirm password do not match", async () => {
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        currPassword: "Aviralyadav@7",
        newPassword: "Aviralyadav@8",
        confirmPassword: "doesNotMatch",
      });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Password and confirm password do not match",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - New password must be at least 8 characters", async () => {
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        currPassword: "Aviralyadav@7",
        newPassword: "small",
        confirmPassword: "small",
      });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "New password must be at least 8 characters",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - Current password is required", async () => {
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        newPassword: "small",
        confirmPassword: "small",
      });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Current password is required",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("400 - Current password is incorrect", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest
      .spyOn(UserService, "fetchUserByEmail")
      .mockResolvedValueOnce(new Users(mockUsers[0]));
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        currPassword: "Aviralyadav@7",
        newPassword: "NotVerysmall",
        confirmPassword: "NotVerysmall",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Current password is incorrect",
      statusCode: 400,
      error: STATUS_CODES[400],
    });
  });

  it("500 - Unexpected error occured while updating password", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest
      .spyOn(UserService, "fetchUserByEmail")
      .mockResolvedValueOnce(new Users(mockUsers[0]));
    jest
      .spyOn(UserService, "updatePasswordbyUser")
      .mockResolvedValueOnce(false);
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        currPassword: "password123",
        newPassword: "NotVerysmall",
        confirmPassword: "NotVerysmall",
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Unexpected error occured while updating password",
      statusCode: 500,
      error: STATUS_CODES[500],
    });
  });

  it("500 - Unexpected error", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest
      .spyOn(UserService, "fetchUserByEmail")
      .mockResolvedValueOnce(new Users(mockUsers[0]));
    jest.spyOn(UserService, "updatePasswordbyUser").mockImplementation(() => {
      throw new Error("Unexpected error");
    });
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        currPassword: "password123",
        newPassword: "NotVerysmall",
        confirmPassword: "NotVerysmall",
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Unexpected error",
      statusCode: 500,
      error: STATUS_CODES[500],
    });
  });

  it("200 - Password updated successfully", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest
      .spyOn(UserService, "fetchUserByEmail")
      .mockResolvedValueOnce(new Users(mockUsers[0]));
    jest.spyOn(UserService, "updatePasswordbyUser").mockResolvedValueOnce(true);
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        currPassword: "password123",
        newPassword: "NotVerysmall",
        confirmPassword: "NotVerysmall",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Password updated successfully",
      statusCode: 200,
    });
  });
});
