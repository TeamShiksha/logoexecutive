const request = require("supertest");
const app = require("../../../../app");
const { mockUsers } = require("../../../../utils/mocks/Users");
const { STATUS_CODES } = require("http");

const { UserService, UserTokenService } = require("../../../../services");
const { Users } = require("../../../../models");
const { error } = require("console");

jest.mock("../../../../services/Users", () => ({
  fetchUserByEmail: jest.fn(),
  updateUser: jest.fn(),
}));
jest.mock("../../../../services/UserToken", () => ({
  createVerifyToken: jest.fn(),
}));

const mockUserModel = new Users(mockUsers[1]);
const ENDPOINT = "/api/user/update-profile";

describe("UpdateProfile Controller", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
    process.env.CLIENT_URL = "http://validcorsorigin.com";
  });
  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_URL;
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

  it("422 - First name is required", async () => {
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        lastName: "Rider",
        newEmail: "ghosty@rider.com",
      });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "First name is required",
      statusCode: 422,
    });
  });

  it("422 - Last name is required", async () => {
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        firstName: "Ghosty",
        newEmail: "ghosty@rider.com",
      });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "Last name is required",
      statusCode: 422,
    });
  });

  it("422 - First name should only contain alphabets", async () => {
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        firstName: "Ghosty1",
        lastName: "Rider@",
        newEmail: "ghostidergod@gmail.com",
      });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "First name should only contain alphabets",
      statusCode: 422,
    });
  });

  it("404 - User not found", async () => {
    jest.spyOn(UserService, "fetchUserByEmail").mockImplementation(() => null);
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        firstName: "Ghosty",
        lastName: "Rider",
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      error: STATUS_CODES[404],
      message: "User not found",
    });
  });

  it("500 - Failed to update profile", async () => {
    jest.spyOn(UserService, "fetchUserByEmail").mockResolvedValueOnce(() => {
      new Users(mockUsers[0]);
    });
    jest.spyOn(UserService, "updateUser").mockResolvedValueOnce(false);
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        firstName: "John",
        lastName: "Doe",
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      statusCode: 500,
      message: "Failed to update profile",
      error: STATUS_CODES[500],
    });
  });

  it("500 - Unexected error", async () => {
    jest.spyOn(UserService, "fetchUserByEmail").mockResolvedValueOnce(() => {
      new Users(mockUsers[0]);
    });
    jest.spyOn(UserService, "updateUser").mockImplementation(() => {
      throw new Error("Unexected error");
    });
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        firstName: "John",
        lastName: "Doe",
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      statusCode: 500,
      message: "Unexected error",
      error: STATUS_CODES[500],
    });
  });

  it("200 - Profile updated successfully", async () => {
    jest.spyOn(UserService, "fetchUserByEmail").mockResolvedValueOnce(() => {
      new Users(mockUsers[0]);
    });
    jest.spyOn(UserService, "updateUser").mockResolvedValueOnce(true);
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        firstName: "John",
        lastName: "Doe",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      message: "Profile updated successfully",
    });
  });
});
