const request = require("supertest");
const { STATUS_CODES } = require("http");
const {
  UserService,
  SendEmailService,
  UserSessionService,
  MfaService,
} = require("../../../services");
const { Users } = require("../../../models");
const { ENDPOINTS } = require("../../../utils/testconstants");
const {
  MOCK_USERS,
  MOCK_USER_SESSIONS,
  MOCK_MFA_SESSIONS,
} = require("../../../utils/mocks");
const { Messages } = require("../../../utils/constants");
const app = require("../../../server");
const dummyPassword =
  require("../../../utils/generatePassword").generatePassword();
const sendEmail = require("../../../utils/sendEmail");
jest.mock("../../../utils/sendEmail");

describe("SIGNIN API", () => {
  beforeAll(() => {
    sendEmail.mockResolvedValue(true);
  });

  it("422 - Invalid email", async () => {
    const response = await request(app)
      .post(ENDPOINTS.SIGNIN)
      .send({ email: "not-an-email" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "Invalid email",
      statusCode: 422,
    });
  });

  it("422 - Password is required", async () => {
    const response = await request(app)
      .post(ENDPOINTS.SIGNIN)
      .send({ email: "email@example.com" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "Password is required",
      statusCode: 422,
    });
  });

  it("404 - Incorrect email or password", async () => {
    jest.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(null);

    const response = await request(app)
      .post(ENDPOINTS.SIGNIN)
      .send({ email: "email@example.com", password: "password" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: STATUS_CODES[404],
      message: Messages.INCORRECT_EMAIL_PASS,
      statusCode: 404,
    });
  });

  it("429 - If token is not expired and user is not verified", async () => {
    const user = {
      ...MOCK_USERS[1],
      is_verified: false,
      is_deleted: false,
      matchPassword: jest.fn().mockResolvedValue(true),
      generateJWT: jest.fn().mockReturnValue("jwt-token"),
    };
    jest.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(user);

    const error = new Error(Messages.EMAIL_NOT_VERIFIED);
    error.statusCode = 429;

    jest
      .spyOn(SendEmailService.prototype, "sendVerificationEmail")
      .mockResolvedValue(error);

    const response = await request(app)
      .post(ENDPOINTS.SIGNIN)
      .send({ email: user.email, password: dummyPassword });

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      source: "resendEmail",
      error: "Too Many Requests",
      message: Messages.EMAIL_NOT_VERIFIED,
      statusCode: 429,
    });
  });

  it("201 - Sent verification email successfully", async () => {
    const user = {
      ...MOCK_USERS[1],
      is_verified: false,
      is_deleted: false,
      matchPassword: jest.fn().mockResolvedValue(true),
      generateJWT: jest.fn().mockReturnValue("jwt-token"),
    };
    jest.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(user);
    jest
      .spyOn(SendEmailService.prototype, "sendVerificationEmail")
      .mockResolvedValue({
        message: Messages.RESEND_EMAIL,
        statusCode: 201,
        source: "resendEmail",
      });

    const response = await request(app)
      .post(ENDPOINTS.SIGNIN)
      .send({ email: user.email, password: dummyPassword });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: Messages.RESEND_EMAIL,
      statusCode: 201,
      source: "resendEmail",
    });
  });

  it("404 - Incorrect password", async () => {
    const user = {
      ...MOCK_USERS[1],
      is_verified: true,
      is_deleted: false,
      matchPassword: jest.fn().mockResolvedValue(false),
      generateJWT: jest.fn().mockReturnValue("jwt-token"),
    };

    jest.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(user);

    const INVAILD = "wrongpassword";
    const response = await request(app)
      .post(ENDPOINTS.SIGNIN)
      .send({ email: user.email, password: INVAILD });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: STATUS_CODES[404],
      message: Messages.INCORRECT_EMAIL_PASS,
      statusCode: 404,
    });
  });

  it("200 - Signin successful", async () => {
    const user = {
      ...MOCK_USERS[1],
      is_verified: true,
      is_deleted: false,
      matchPassword: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(user);
    jest
      .spyOn(UserSessionService.prototype, "createSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[0]);

    const response = await request(app)
      .post(ENDPOINTS.SIGNIN)
      .send({ email: user.email, password: dummyPassword });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ statusCode: 200 });
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("200 - Guest Signin successful", async () => {
    jest
      .spyOn(UserService.prototype, "getGuestUser")
      .mockImplementation(() => new Users(MOCK_USERS[4]));
    const response = await request(app)
      .post(`${ENDPOINTS.SIGNIN}?type=guest`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
    });
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("200 - Signin successful and set mfa cookie ", async () => {
    const user = new Users(MOCK_USERS[1]);
    user.mfaEnabled = true;
    user.matchPassword = jest.fn().mockResolvedValue(true);
    const mfaSession = MOCK_MFA_SESSIONS[0];

    jest.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(user);
    jest
      .spyOn(MfaService.prototype, "createSession")
      .mockResolvedValue(mfaSession);

    const response = await request(app)
      .post(ENDPOINTS.SIGNIN)
      .send({ email: user.email, password: dummyPassword });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ statusCode: 200, mfaRequired: true });
    expect(response.headers["set-cookie"]).toBeDefined();
  });
  it("200 - Signin successful with mfa ", async () => {
    const mfaSession = MOCK_MFA_SESSIONS[0];
    jest
      .spyOn(MfaService.prototype, "findAndUpdateActiveSession")
      .mockResolvedValue(MOCK_MFA_SESSIONS[0]);
    jest.spyOn(MfaService.prototype, "mfaLogin").mockResolvedValue(true);
    jest
      .spyOn(UserSessionService.prototype, "createSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[0]);

    const response = await request(app)
      .post(ENDPOINTS.SIGNIN_WITH_MFA)
      .set("Cookie", `mfaSessionId=${mfaSession.sessionId}`)
      .send({ token: "123456" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ statusCode: 200 });
    expect(response.headers["set-cookie"]).toBeDefined();
  });
});
