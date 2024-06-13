const request = require("supertest");
const { STATUS_CODES } = require("http");
const app = require("../../../../app");

const { UserService, SubscriptionService } = require("../../../../services");
const SendEmailService = require("../../../../utils/sendEmail");
const { mockUsers } = require("../../../../utils/mocks/Users");
const { mockUserTokens } = require("../../../../utils/mocks/UserToken");
const { Users, UserToken } = require("../../../../models");
const mockUserModel = new Users(mockUsers[0]);
const mockUserTokenVerify = new UserToken(mockUserTokens[0]);

const mockValidPayload = {
  firstName: "Joe",
  lastName: "Doe",
  email: "Joe@example.com",
  password: "good joe",
  confirmPassword: "good joe",
};

jest.mock("../../../../services/Users", () => ({
  emailRecordExists: jest.fn(),
  createUser: jest.fn(),
}));
jest.mock("../../../../services/Subscriptions", () => ({
  createSubscription: jest.fn(),
}));
jest.mock("../../../../services/UserToken", () => ({
  createVerifyToken: jest.fn(),
}));
const UserTokenService = require("../../../../services/UserToken");
jest.mock("../../../../utils/sendEmail", () => ({
  sendEmail: jest.fn(),
}));

const ENDPOINT = "/api/auth/signup";

describe("Signup Controller", () => {
  beforeAll(() => {
    process.env.CLIENT_PROXY_URL = "https://exmample.com";
    process.env.CLIENT_URL = "https://exmample.com";
  });
  afterAll(() => {
    delete process.env.CLIENT_PROXY_URL;
    delete process.env.CLIENT_URL;
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("500 - Not allowed by CORS", async () => {
    const response = await request(app)
      .get(ENDPOINT)
      .set("Origin", "https://invalid.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("422 - First name is required", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .send({ user: "hello world" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "First name is required",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - Last name is required", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .send({ firstName: "hello world" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Last name is required",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - Email is required", async () => {
    const response = await request(app).post(ENDPOINT).send({
      firstName: "hello world",
      lastName: "hello world",
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Email is required",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - First name should only contain alphbets", async () => {
    const mockPayload = { ...mockValidPayload, firstName: "J*e" };
    const response = await request(app).post(ENDPOINT).send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "First name should only contain alphabets",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - Last name should only contain alphabets", async () => {
    const mockPayload = { ...mockValidPayload, lastName: "D*e" };
    const response = await request(app).post(ENDPOINT).send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Last name should only contain alphabets",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - Invalid email", async () => {
    const mockPayload = { ...mockValidPayload, email: "johnDoe" };
    const response = await request(app).post(ENDPOINT).send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Invalid email",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - Password must be at least 8 characters", async () => {
    const mockPayload = { ...mockValidPayload, password: "johnDoe" };
    const response = await request(app).post(ENDPOINT).send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Password must be at least 8 characters",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - Password must be 30 characters or fewer", async () => {
    const mockPayload = {
      ...mockValidPayload,
      password: "areallylongstringaspasswordover30characterslong",
    };
    const response = await request(app).post(ENDPOINT).send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Password must be 30 characters or fewer",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - Password and confirm password do not match", async () => {
    const mockPayload = {
      ...mockValidPayload,
      confirmPassword: "randompassword",
    };
    const response = await request(app).post(ENDPOINT).send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Password and confirm password do not match",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("400 - Email already exists", async () => {
    jest.spyOn(UserService, "emailRecordExists").mockImplementation(() => true);
    const response = await request(app).post(ENDPOINT).send(mockValidPayload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Email already exists",
      statusCode: 400,
      error: STATUS_CODES[400],
    });
  });

  it("500 - Unexpected error occurred while creating user", async () => {
    jest
      .spyOn(UserService, "emailRecordExists")
      .mockImplementation(() => false);
    jest.spyOn(UserService, "createUser").mockImplementation(() => null);
    const response = await request(app).post(ENDPOINT).send(mockValidPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Unexpected error occurred while creating user",
      error: STATUS_CODES[500],
      statusCode: 500,
    });
  });

  it("500 - Unexpected error", async () => {
    jest.spyOn(UserService, "emailRecordExists").mockImplementation(() => {
      throw new Error("Unexpected error");
    });
    const response = await request(app).post(ENDPOINT).send(mockValidPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Unexpected error",
      error: STATUS_CODES[500],
      statusCode: 500,
    });
  });

  it("206 - Unexpected error occurred while creating subscription", async () => {
    jest
      .spyOn(UserService, "emailRecordExists")
      .mockImplementation(() => false);
    jest
      .spyOn(UserService, "createUser")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(SubscriptionService, "createSubscription")
      .mockImplementation(() => null);
    const response = await request(app).post(ENDPOINT).send(mockValidPayload);

    expect(response.status).toBe(206);
    expect(response.body).toEqual({
      message:
        "Successfully created user but Unexpected error occurred while creating subscription",
      statusCode: 201,
    });
  });

  it("206 - User created successfully. Verification email failed to send.", async () => {
    jest
      .spyOn(UserService, "emailRecordExists")
      .mockImplementation(() => false);
    jest
      .spyOn(UserService, "createUser")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(SubscriptionService, "createSubscription")
      .mockImplementation(() => true);
    jest
      .spyOn(UserTokenService, "createVerifyToken")
      .mockImplementation(() => null);
    const response = await request(app).post(ENDPOINT).send(mockValidPayload);

    expect(response.status).toBe(206);
    expect(response.body).toEqual({
      message:
        "user created successfully. Verification email failed to send. Please visit our contact page for assistance. We're here to help.",
      statusCode: 201,
    });
  });

  it("206 - User created successfully. Verification email failed to send", async () => {
    jest
      .spyOn(UserService, "emailRecordExists")
      .mockImplementation(() => false);
    jest
      .spyOn(UserService, "createUser")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(SubscriptionService, "createSubscription")
      .mockImplementation(() => true);
    jest
      .spyOn(UserTokenService, "createVerifyToken")
      .mockImplementation(() => mockUserTokenVerify);
    jest
      .spyOn(SendEmailService, "sendEmail")
      .mockImplementation(() => ({ success: false }));
    const response = await request(app).post(ENDPOINT).send(mockValidPayload);

    expect(response.status).toBe(206);
    expect(response.body).toEqual({
      message:
        "User created successfully. Verification email failed to send. Please visit our contact page for assistance. We're here to help.",
      statusCode: 201,
    });
  });

  it("201 - User created successfully. Verification email sent.", async () => {
    jest
      .spyOn(UserService, "emailRecordExists")
      .mockImplementation(() => false);
    jest
      .spyOn(UserService, "createUser")
      .mockImplementation(() => mockUserModel);
    jest
      .spyOn(SubscriptionService, "createSubscription")
      .mockImplementation(() => true);
    jest
      .spyOn(UserTokenService, "createVerifyToken")
      .mockImplementation(() => mockUserTokenVerify);
    jest
      .spyOn(SendEmailService, "sendEmail")
      .mockImplementation(() => ({ success: true }));
    const response = await request(app).post(ENDPOINT).send(mockValidPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "User created successfully. Verification email sent",
      statusCode: 201,
    });
  });
});
