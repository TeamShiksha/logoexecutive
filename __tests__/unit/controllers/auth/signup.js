const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");

const mockValidPayload = {
  firstName: "Joe",
  lastName: "Doe",
  email: "Joe@example.com",
  password: "good joe",
  confirmPassword: "good joe",
};

jest.mock("../../../../services/Auth", () => ({
  emailRecordExists: jest.fn(),
}));
const AuthService = require("../../../../services/Auth");
jest.mock("../../../../services/User", () => ({
  createUser: jest.fn(),
}));
const UserService = require("../../../../services/User");
jest.mock("../../../../services/Subscription", () => ({
  createSubscription: jest.fn(),
}));
const SubscriptionService = require("../../../../services/Subscription");
jest.mock("../../../../services/UserToken", () => ({
  createVerifyToken: jest.fn(),
}));
const UserTokenService = require("../../../../services/UserToken");
jest.mock("../../../../services/sendEmail", () => ({
  sendEmail: jest.fn(),
}));
const SendEmailService = require("../../../../services/sendEmail");

const { mockUsers } = require("../../../../utils/mocks/Users");
const { mockUserTokens } = require("../../../../utils/mocks/UserToken");
const User = require("../../../../models/Users");
const UserToken = require("../../../../models/UserToken");

const mockUserModel = new User(mockUsers[0]);
const mockUserTokenVerify = new UserToken(mockUserTokens[0]);

describe("Signup Controller", () => {
  beforeAll(() => {
    process.env.BASE_URL = "https://exmample.com";
  });
  afterAll(() => {
    delete process.env.BASE_URL;
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("422 - when payload has missing fields", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({ user: "hello world" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual([
      {
        message: "\"firstName\" is required",
        statusCode: 422,
        error: STATUS_CODES[422],
      },
    ]);
  });

  it("422 - when firstName contains special characters", async () => {
    const mockPayload = { ...mockValidPayload, firstName: "J*e" };

    const response = await request(app).post("/api/auth/signup").send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual([
      {
        message: "firstName should not contain any special character or number",
        statusCode: 422,
        error: STATUS_CODES[422],
      },
    ]);
  });

  it("422 - when lastName contains special characters", async () => {
    const mockPayload = { ...mockValidPayload, lastName: "D*e" };

    const response = await request(app).post("/api/auth/signup").send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual([
      {
        message: "lastName should not contain any special character or number",
        statusCode: 422,
        error: STATUS_CODES[422],
      },
    ]);
  });

  it("422 - when email is invalid", async () => {
    const mockPayload = { ...mockValidPayload, email: "johnDoe" };

    const response = await request(app).post("/api/auth/signup").send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual([
      {
        message: "email should be valid",
        statusCode: 422,
        error: STATUS_CODES[422],
      },
    ]);
  });

  it("422 - when password is invalid (too short)", async () => {
    const mockPayload = { ...mockValidPayload, password: "johnDoe" };

    const response = await request(app).post("/api/auth/signup").send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual([
      {
        message: "\"password\" length must be at least 8 characters long",
        statusCode: 422,
        error: STATUS_CODES[422],
      },
    ]);
  });

  it("422 - when password is invalid (too long)", async () => {
    const mockPayload = {
      ...mockValidPayload,
      password: "areallylongstringaspasswordover30characterslong",
    };

    const response = await request(app).post("/api/auth/signup").send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual([
      {
        message: "\"password\" length must be less than or equal to 30 characters long",
        statusCode: 422,
        error: STATUS_CODES[422],
      },
    ]);
  });

  it("422 - when confirm password doesn't match", async () => {
    const mockPayload = {
      ...mockValidPayload,
      confirmPassword: "randompassword"
    };

    const response = await request(app).post("/api/auth/signup").send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual([
      {
        message: "Confirm Password should match password",
        statusCode: 422,
        error: STATUS_CODES[422],
      },
    ]);
  });

  it("400 - when email already exists in db", async () => {
    jest.spyOn(AuthService, "emailRecordExists").mockImplementation(() => true);

    const response = await request(app)
      .post("/api/auth/signup")
      .send(mockValidPayload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual([
      {
        message: "Email already exists",
        statusCode: 400,
        error: STATUS_CODES[400],
      },
    ]);
  });

  it("500 - when failed to create user", async () => {
    jest.spyOn(AuthService, "emailRecordExists").mockImplementation(() => false);
    jest.spyOn(UserService, "createUser").mockImplementation(() => null);

    const response = await request(app)
      .post("/api/auth/signup")
      .send(mockValidPayload);

    expect(response.status).toBe(500);
    console.log("response.body", response.body);
    expect(response.body).toEqual({
      message: "Unexpected error occurred while creating user",
      error: STATUS_CODES[500],
      statusCode: 500,
    });
  });

  it("206 - when failed to create user subscription", async () => {
    jest.spyOn(AuthService, "emailRecordExists").mockImplementation(() => false);
    jest.spyOn(UserService, "createUser").mockImplementation(() => mockUserModel);
    jest.spyOn(SubscriptionService, "createSubscription").mockImplementation(() => null);

    const response = await request(app)
      .post("/api/auth/signup")
      .send(mockValidPayload);

    expect(response.status).toBe(206);
    expect(response.body).toEqual({
      message:
        "Successfully created user but Unexpected error occurred while creating subscription",
      statusCode: 201,
    });
  });

  it("206 - when failed to create user user token", async () => {
    jest.spyOn(AuthService, "emailRecordExists").mockImplementation(() => false);
    jest.spyOn(UserService, "createUser").mockImplementation(() => mockUserModel);
    jest.spyOn(SubscriptionService, "createSubscription").mockImplementation(() => true);
    jest.spyOn(UserTokenService, "createVerifyToken").mockImplementation(() => null);

    const response = await request(app)
      .post("/api/auth/signup")
      .send(mockValidPayload);

    expect(response.status).toBe(206);
    expect(response.body).toEqual({
      message:
        "user created successfully. Verification email failed to send. Please visit our contact page for assistance. We're here to help.",
      statusCode: 201,
    });
  });

  it("206 - when failed to send verification email", async () => {
    jest.spyOn(AuthService, "emailRecordExists").mockImplementation(() => false);
    jest.spyOn(UserService, "createUser").mockImplementation(() => mockUserModel);
    jest.spyOn(SubscriptionService, "createSubscription").mockImplementation(() => true);
    jest.spyOn(UserTokenService, "createVerifyToken").mockImplementation(() => mockUserTokenVerify);
    jest.spyOn(SendEmailService, "sendEmail").mockImplementation(() => ({ success: false }));

    const response = await request(app)
      .post("/api/auth/signup")
      .send(mockValidPayload);
    expect(response.status).toBe(206);
    expect(response.body).toEqual({
      message:
        "User created successfully. Verification email failed to send. Please visit our contact page for assistance. We're here to help.",
      statusCode: 201,
    });
  });

  it("Success 201", async () => {
    jest.spyOn(AuthService, "emailRecordExists").mockImplementation(() => false);
    jest.spyOn(UserService, "createUser").mockImplementation(() => mockUserModel);
    jest.spyOn(SubscriptionService, "createSubscription").mockImplementation(() => true);
    jest.spyOn(UserTokenService, "createVerifyToken").mockImplementation(() => mockUserTokenVerify);
    jest.spyOn(SendEmailService, "sendEmail").mockImplementation(() => ({ success: true }));
    const response = await request(app)
      .post("/api/auth/signup")
      .send(mockValidPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message:
        "user created successfully and verification email sent on your email.",
      statusCode: 201,
    });
  });

  it("Error 500 - Unexpected error", async () => {
    jest.spyOn(AuthService, "emailRecordExists").mockImplementation(() => {throw new Error("Unexpected error");});

    const response = await request(app).post("/api/auth/signup").send(mockValidPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Unexpected error",
      error: STATUS_CODES[500],
      statusCode: 500
    });
  });
});
