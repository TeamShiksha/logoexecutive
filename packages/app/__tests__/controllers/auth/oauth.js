const request = require("supertest");
const { STATUS_CODES } = require("http");
const {
  AuthService,
  UserSessionService,
  MfaService,
} = require("../../../services");
const { ENDPOINTS } = require("../../../utils/testconstants");
const {
  MOCK_USERS,
  MOCK_USER_SESSIONS,
  MOCK_MFA_SESSIONS,
} = require("../../../utils/mocks");
const { Messages, OAuthErrorCodes } = require("../../../utils/constants");
const oauth = require("../../../utils/oauth");
const app = require("../../../server");

jest.mock("../../../utils/oauth", () => ({
  ...jest.requireActual("../../../utils/oauth"),
  generateAuthUrl: jest.fn(),
  isSupportedProvider: jest.requireActual("../../../utils/oauth")
    .isSupportedProvider,
}));

describe("OAuth Auth API", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CLIENT_URL: "http://localhost:8080",
      GOOGLE_CLIENT_ID: "google-client-id",
      GOOGLE_CLIENT_SECRET: "google-client-secret",
      GOOGLE_REDIRECT_URI: "http://localhost:5000/api/auth/google/callback",
      DISCORD_CLIENT_ID: "discord-client-id",
      DISCORD_CLIENT_SECRET: "discord-client-secret",
      DISCORD_REDIRECT_URI: "http://localhost:5000/api/auth/discord/callback",
      GITHUB_CLIENT_ID: "github-client-id",
      GITHUB_CLIENT_SECRET: "github-client-secret",
      GITHUB_REDIRECT_URI: "http://localhost:5000/api/auth/github/callback",
      LINKEDIN_CLIENT_ID: "linkedin-client-id",
      LINKEDIN_CLIENT_SECRET: "linkedin-client-secret",
      LINKEDIN_REDIRECT_URI: "http://localhost:5000/api/auth/linkedin/callback",
    };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("GET /api/auth/:provider", () => {
    it("400 - Unsupported provider", async () => {
      const response = await request(app).get("/api/auth/facebook");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: STATUS_CODES[400],
        message: Messages.UNSUPPORTED_OAUTH_PROVIDER,
        statusCode: 400,
      });
    });

    it("200 - Returns auth URL and sets oauth_state cookie", async () => {
      oauth.generateAuthUrl.mockReturnValue({
        url: "https://accounts.google.com/o/oauth2/v2/auth?state=abc123",
        state: "abc123",
      });

      const response = await request(app).get(ENDPOINTS.OAUTH_GOOGLE);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        url: "https://accounts.google.com/o/oauth2/v2/auth?state=abc123",
      });
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("oauth_state=abc123")])
      );
    });
  });

  describe("GET /api/auth/:provider/callback", () => {
    it("redirects with invalid_state when state cookie is missing", async () => {
      const response = await request(app).get(
        `${ENDPOINTS.OAUTH_GOOGLE_CALLBACK}?code=auth-code&state=abc123`
      );

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(
        `http://localhost:8080/?error=${OAuthErrorCodes.INVALID_STATE}`
      );
    });

    it("redirects with invalid_state when state does not match", async () => {
      const response = await request(app)
        .get(`${ENDPOINTS.OAUTH_GOOGLE_CALLBACK}?code=auth-code&state=wrong`)
        .set("Cookie", ["oauth_state=expected"]);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(
        `http://localhost:8080/?error=${OAuthErrorCodes.INVALID_STATE}`
      );
    });

    it("redirects to dashboard and sets session cookie on success", async () => {
      const user = {
        ...MOCK_USERS[1],
        mfaEnabled: false,
        is_deleted: false,
      };

      jest
        .spyOn(AuthService.prototype, "processOAuthCallback")
        .mockResolvedValue(user);
      jest
        .spyOn(UserSessionService.prototype, "createSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);

      const response = await request(app)
        .get(`${ENDPOINTS.OAUTH_GOOGLE_CALLBACK}?code=auth-code&state=abc123`)
        .set("Cookie", ["oauth_state=abc123"]);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("http://localhost:8080/dashboard");
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            `sessionId=${MOCK_USER_SESSIONS[0].sessionId}`
          ),
        ])
      );
      expect(AuthService.prototype.processOAuthCallback).toHaveBeenCalledWith(
        "google",
        "auth-code"
      );
    });

    it("redirects to MFA flow when user has MFA enabled", async () => {
      const user = {
        ...MOCK_USERS[1],
        mfaEnabled: true,
        is_deleted: false,
      };

      jest
        .spyOn(AuthService.prototype, "processOAuthCallback")
        .mockResolvedValue(user);
      jest.spyOn(MfaService.prototype, "createSession").mockResolvedValue({
        ...MOCK_MFA_SESSIONS[0],
        sessionId: MOCK_MFA_SESSIONS[0].sessionId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      const response = await request(app)
        .get(`${ENDPOINTS.OAUTH_GOOGLE_CALLBACK}?code=auth-code&state=abc123`)
        .set("Cookie", ["oauth_state=abc123"]);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(
        "http://localhost:8080/?mfaRequired=true&from=oauth"
      );
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("mfaSessionId=")])
      );
    });

    it("redirects with account_deleted when AuthService throws", async () => {
      const error = new Error(Messages.ACCOUNT_DELETED);
      error.code = OAuthErrorCodes.ACCOUNT_DELETED;

      jest
        .spyOn(AuthService.prototype, "processOAuthCallback")
        .mockRejectedValue(error);

      const response = await request(app)
        .get(`${ENDPOINTS.OAUTH_GOOGLE_CALLBACK}?code=auth-code&state=abc123`)
        .set("Cookie", ["oauth_state=abc123"]);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(
        `http://localhost:8080/?error=${OAuthErrorCodes.ACCOUNT_DELETED}`
      );
    });

    it("redirects with no_email_provided when AuthService throws", async () => {
      const error = new Error(Messages.NO_EMAIL_PROVIDED);
      error.code = OAuthErrorCodes.NO_EMAIL_PROVIDED;

      jest
        .spyOn(AuthService.prototype, "processOAuthCallback")
        .mockRejectedValue(error);

      const response = await request(app)
        .get(`${ENDPOINTS.OAUTH_DISCORD_CALLBACK}?code=auth-code&state=abc123`)
        .set("Cookie", ["oauth_state=abc123"]);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(
        `http://localhost:8080/?error=${OAuthErrorCodes.NO_EMAIL_PROVIDED}`
      );
    });
  });
});
