const request = require("supertest");
const { STATUS_CODES } = require("http");
const app = require("../../../../app");

const { UserTokenService, UserService } = require("../../../../services");
const SendEmailService = require("../../../../utils/sendEmail");
const { Users, UserToken } = require("../../../../models");
const { mockUsers } = require("../../../../utils/mocks/Users");
const { mockUserTokens } = require("../../../../utils/mocks/UserToken");

jest.mock("../../../../services/UserToken", () => ({
  createForgotToken: jest.fn(),
}));
jest.mock("../../../../services/Users", () => ({
  fetchUserByEmail: jest.fn(),
}));
jest.mock("../../../../utils/sendEmail", () => ({
  sendEmail: jest.fn(),
}));

const ENDPOINT = "/api/auth/forgot-password";
const mockPayload = { email: "johndoe@example.com" };

describe("/forgot-password", () => {
  const fetchUserByEmailSpy = jest.spyOn(UserService, "fetchUserByEmail");
  const createForgotTokenSpy = jest.spyOn(
    UserTokenService,
    "createForgotToken"
  );
  const SendEmailSpy = jest.spyOn(SendEmailService, "sendEmail");

  beforeAll(() => {
    process.env.CLIENT_URL = "http://example.com";
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  afterAll(() => {
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

  it("422 - Invalid Email", async () => {
    const response = await request(app).post(ENDPOINT).send({ email: "123" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      statusCode: 422,
      message: "Invalid email",
    });
  });

  it("422 - invalid payload fields (missing email)", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .send({ payload: "123" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      statusCode: 422,
      message: "Email is required",
    });
  });

  it("404 - Email does not exist", async () => {
    fetchUserByEmailSpy.mockImplementation(() => null);
    const response = await request(app).post(ENDPOINT).send(mockPayload);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: STATUS_CODES[404],
      message: "Email does not exist",
      statusCode: 404,
    });
  });

  it("503 - Unable to process forgot password request", async () => {
    fetchUserByEmailSpy.mockImplementation(() => new Users(mockUsers[1]));
    createForgotTokenSpy.mockImplementation(() => null);
    const response = await request(app).post(ENDPOINT).send(mockPayload);

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: STATUS_CODES[503],
      message: "Unable to process forgot password request",
      statusCode: 503,
    });
  });

  it("500 - Failed to send email", async () => {
    fetchUserByEmailSpy.mockImplementation(() => new Users(mockUsers[1]));
    createForgotTokenSpy.mockImplementation(
      () => new UserToken(mockUserTokens[2])
    );
    SendEmailSpy.mockImplementation(() => ({ success: false }));
    const response = await request(app).post(ENDPOINT).send(mockPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Failed to send email",
      statusCode: 500,
    });
  });

  it("500 - Unexected error", async () => {
    fetchUserByEmailSpy.mockImplementation(() => {
      throw Error("Unexected error");
    });
    const response = await request(app).post(ENDPOINT).send(mockPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Unexected error",
      error: STATUS_CODES[500],
      statusCode: 500,
    });
  });

  it("200 - Successfully sent email", async () => {
    fetchUserByEmailSpy.mockImplementation(() => new Users(mockUsers[1]));
    createForgotTokenSpy.mockImplementation(
      () => new UserToken(mockUserTokens[2])
    );
    SendEmailSpy.mockImplementation(() => ({ success: true }));
    const response = await request(app).post(ENDPOINT).send(mockPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      message:
        "Please check your email for a password reset link. If it's not there, check your spam folder",
    });
  });
});
