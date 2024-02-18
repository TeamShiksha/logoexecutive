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

  it("422 - email is required", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .send({ user: "hello world" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "\"email\" is required",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - email is not valid", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .send({ email: "**BAD STRING**" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Email is not valid",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - password is required", async () => {
    const response = await request(app).post(ENDPOINT).send({
      email: "john@doe.com"
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "\"password\" is required",
      statusCode: 422
    });
  });

  it("422 - password should be more than 8 characters", async () => {
    const response = await request(app).post(ENDPOINT).send({
      email: "john@doe.com",
      password: "john"
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "\"password\" length must be at least 8 characters long",
      statusCode: 422
    });
  });

  it("422 - password should be more than 8 characters", async () => {
    const response = await request(app).post(ENDPOINT).send({
      email: "john@doe.com",
      password: "john's very long password, to fail the test"
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "\"password\" length must be less than or equal to 30 characters long",
      statusCode: 422
    });
  });

  it("401 - Email or Password incorrect (email does not exist)", async ()  => {
    jest.spyOn(UserService, "fetchUserByEmail").mockImplementation(() => null);

    const response = await request(app).post(ENDPOINT).send({
      email: "john@doe.com",
      password: "john password"
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: STATUS_CODES[401],
      message: "Email or Password incorrect",
      statusCode: 401
    });
  });

  it("401 - User not verified", async () => {
    jest.spyOn(UserService, "fetchUserByEmail").mockImplementation(() => new Users(mockUsers[0]));

    const response = await request(app).post(ENDPOINT).send({
      email: "john.doe@example.com",
      password: "password122"
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: STATUS_CODES[401],
      message: "Email is not verified",
      statusCode: 401
    });
  });

  it("401 - Email or Password incorrect (password does not match)", async () => {
    jest.spyOn(UserService, "fetchUserByEmail").mockImplementation(() => new Users(mockUsers[1]));

    const response = await request(app).post(ENDPOINT).send({
      email: "john.doe@example.com",
      password: "password122"
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: STATUS_CODES[401],
      message: "Email or Password incorrect",
      statusCode: 401
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

  it("200 - Success path", async () => {
    jest.spyOn(UserService, "fetchUserByEmail").mockImplementation(() => new Users(mockUsers[1]));

    const response = await request(app).post(ENDPOINT).send({
      email: "johndoe@example.com",
      password: "password123"
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Succesfully signed in");
  });
});
