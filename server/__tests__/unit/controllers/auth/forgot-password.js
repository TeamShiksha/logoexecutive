const request = require("supertest");
const { STATUS_CODES } = require("http");
const app = require("../../../../app");

const { UserTokenService, UserService } = require("../../../../services");
const SendEmailService = require("../../../../utils/sendEmail");
const { Users, UserToken} = require("../../../../models");
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
  const createForgotTokenSpy = jest.spyOn(UserTokenService,"createForgotToken");
  const SendEmailSpy = jest.spyOn(SendEmailService, "sendEmail");

  beforeAll(() => {
    process.env.BASE_URL = "http://example.com";
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  afterAll(() => {
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

  it("422 - on invalid payload regex", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .send({ email: "123" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      statusCode: 422,
      message: "Invalid Email.",
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
      message: "\"email\" is required",
    });
  });

  it("422 - invalid fields (extra fields)", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .send({ email: "hello@example.com", extraField: "123" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      statusCode: 422,
      message: "\"extraField\" is not allowed",
    });
  });

  it("404 - user not found", async () => {
    fetchUserByEmailSpy.mockImplementation(() => null);

    const response = await request(app)
      .post(ENDPOINT)
      .send(mockPayload);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: STATUS_CODES[404],
      message: "Email does not exist.",
      statusCode: 404,
    });
  });

  it("503 - unable to create forgot token", async () => {
    fetchUserByEmailSpy.mockImplementation(() => new Users(mockUsers[1]));
    createForgotTokenSpy.mockImplementation(() => null);

    const response = await request(app)
      .post(ENDPOINT)
      .send(mockPayload);

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: STATUS_CODES[503],
      message: "Unable to process forgot password request",
      statusCode: 503,
    });
  });

  it("500 - unable to send forgot token via mail", async () => {
    fetchUserByEmailSpy.mockImplementation(() => new Users(mockUsers[1]));
    createForgotTokenSpy.mockImplementation(() => new UserToken(mockUserTokens[2]));
    SendEmailSpy.mockImplementation(() => ({ success: false }));

    const response = await request(app)
      .post(ENDPOINT)
      .send(mockPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Failed to send email",
      statusCode: 500,
    });
  });

  it("200 - success", async () => {
    fetchUserByEmailSpy.mockImplementation(() => new Users(mockUsers[1]));
    createForgotTokenSpy.mockImplementation(() =>new UserToken(mockUserTokens[2]));
    SendEmailSpy.mockImplementation(() => ({ success: true }));

    const response = await request(app)
      .post(ENDPOINT)
      .send(mockPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Successfully sent email" });
  });

  it("should throw error if unexpected thing happens", async () => {
    fetchUserByEmailSpy.mockImplementation(() => {
      throw Error("test error");
    });

    const response = await request(app)
      .post(ENDPOINT)
      .send(mockPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "test error",
      error: STATUS_CODES[500],
      statusCode: 500
    });
  });
});
