const request = require("supertest");
const app = require("../../../../app");
const { mockUsers } = require("../../../../utils/mocks/Users");
const { STATUS_CODES } = require("http");

const UsersService = require("../../../../services/User");
const UserTokenService = require("../../../../services/UserToken");
const User = require("../../../../models/Users");

jest.mock("../../../../services/User", () =>({
  fetchUserByEmail: jest.fn(),
  updateUser: jest.fn(),
}));

jest.mock("../../../../services/UserToken", () =>({
  createVerifyToken: jest.fn(),
}));

const mockUserModel = new User(mockUsers[1]);

const ENDPOINT = "/api/users/update";

describe("POST /users/update", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
    process.env.BASE_URL = "http://validcorsorigin.com";
  });
  afterAll(() =>{
    delete process.env.JWT_SECRET;
    delete process.env.BASE_URL;
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

  it("422 - email is missing", async () => {
    const mockToken = mockUserModel.generateJWT();

    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        firstName: "Ghosty",
        lastName: "Rider",
      });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: "Unprocessable Entity",
      message: "\"email\" is required",
      status: 422,
    });
  });

  it("422 - firstName is missing", async () => {
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
      error: "Unprocessable Entity",
      message: "\"firstName\" is required",
      status: 422,
    });
  }, 5000);

  it("422 - lastName is missing", async () => {
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
      error: "Unprocessable Entity",
      message: "\"lastName\" is required",
      status: 422,
    });
  });

  it("422 - firstName or lastName contains special characters or numbers", async () => {
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
      error: "Unprocessable Entity",
      message: "firstName should not contain any special character or number",
      status: 422,
    });
  });

  it("422 - email is not in a valid format", async () => {
    const mockToken = mockUserModel.generateJWT();

    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        firstName: "Ghosty",
        lastName: "Rider",
        newEmail: "ghostidergod@gmail",
      });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: "Unprocessable Entity",
      message: "\"email\" is required",
      status: 422,
    });
  });

  it("404 - user does not exist", async () => {
    jest.spyOn(UsersService, "fetchUserByEmail").mockImplementation(() => null);

    const mockToken = mockUserModel.generateJWT();

    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        firstName: "Ghosty",
        lastName: "Rider",
        email: "ghosty@rider.com",
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 404,
      error: STATUS_CODES[404],
      message: "User not found",
    });
  });

  it("500 - fail to create a verification token", async () => {
    jest.spyOn(UsersService, "fetchUserByEmail").mockImplementation(() => mockUserModel);
    jest.spyOn(UserTokenService, "createVerifyToken").mockImplementation(() => null);

    const mockToken = mockUserModel.generateJWT();

    const response = await request(app)
      .patch(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({
        firstName: "Ghosty",
        lastName: "Rider",
        email: "ghosty@rider.com",
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual([
      {
        statusCode: 500,
        error: STATUS_CODES[500],
        message: "Failed to create email verification token"
      }
    ]);
  });
});
