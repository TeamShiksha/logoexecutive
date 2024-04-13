const request = require("supertest");
const { STATUS_CODES } = require("http");

const app = require("../../../../app");
const { Users } = require("../../../../models");
const { UserService } = require("../../../../services");
const { mockUsers } = require("../../../../utils/mocks/Users");

jest.mock("../../../../services/Users", () => ({
  fetchUserByEmail: jest.fn()
}));
jest.mock("../../../../services/Subscriptions", () => ({
  fetchSubscriptionByuserid: jest.fn(),
}));

const ENDPOINT = "/api/auth/signin";

describe("Signin Controller", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "mysecret";
    process.env.BASE_URL = "http://validcorsorigin.com";
  });
  afterAll(() => {
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

  it("422 - Email is required", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .send({ user: "hello world" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Email is required",
      statusCode: STATUS_CODES[422],
      error: "Unprocessable payload",
    });
  });

  it("422 - Invalid email", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .send({ email: "**BAD STRING**" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Invalid email",
      statusCode: STATUS_CODES[422],
      error: "Unprocessable payload",
    });
  });

  it("422 - Password is required", async () => {
    const response = await request(app).post(ENDPOINT).send({
      email: "john@doe.com"
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: "Unprocessable payload",
      message: "Password is required",
      statusCode: STATUS_CODES[422]
    });
  });

  it("422 - Password must be a string", async () => {
    const response = await request(app).post(ENDPOINT).send({
      email: "john@doe.com",
      password: 5
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: "Unprocessable payload",
      message: "Password must be string",
      statusCode: STATUS_CODES[422]
    });
  });

  it("404 - Email does not exist", async ()  => {
    jest.spyOn(UserService, "fetchUserByEmail").mockImplementation(() => null);
    const response = await request(app).post(ENDPOINT).send({
      email: "john@doe.com",
      password: "john password"
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Not found",
      message: "Incorrect email or password",
      statusCode: STATUS_CODES[404]
    });
  });

  it("403 - Email not verified", async () => {
    jest.spyOn(UserService, "fetchUserByEmail").mockImplementation(() => new Users(mockUsers[0]));
    const response = await request(app).post(ENDPOINT).send({
      email: "john.doe@example.com",
      password: "password122"
    });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "Forbidden",
      message: "Email not verified",
      statusCode: STATUS_CODES[403]
    });
  });

  it("401 - Incorrect email or password", async () => {
    jest.spyOn(UserService, "fetchUserByEmail").mockImplementation(() => new Users(mockUsers[1]));
    const response = await request(app).post(ENDPOINT).send({
      email: "john.doe@example.com",
      password: "password122"
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Unauthorized",
      message: "Incorrect email or password",
      statusCode: STATUS_CODES[401]
    });
  });

  it("500 - Unexpected errors", async () => {
    jest.spyOn(UserService, "fetchUserByEmail").mockImplementation(() => {throw new Error("Unexected error");});
    const response = await request(app).post(ENDPOINT).send({
      email: "johndoe@example.com",
      password: "password122"
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Unexected error",
      statusCode: 500
    });
  });

  it("200 - Sign In Successful", async () => {
    jest.spyOn(UserService, "fetchUserByEmail").mockImplementation(() => new Users(mockUsers[1]));
    const response = await request(app).post(ENDPOINT).send({
      email: "johndoe@example.com",
      password: "password123"
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Sign In Successful");
  });
});
