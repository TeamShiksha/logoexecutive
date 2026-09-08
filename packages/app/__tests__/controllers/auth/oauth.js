const request = require("supertest");
const app = require("../../../server");
const {
  UserService,
  UserSessionService,
  SubscriptionService,
} = require("../../../services");
const oauthUtility = require("../../../utils/oauth");

describe("OAuth Controller Tests", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET /api/auth/:provider (Initiate)", () => {
    it("should return 400 for unsupported provider", async () => {
      const res = await request(app).get("/api/auth/unsupported");
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Unsupported auth provider");
    });

    it("should return 200 and authorization URL for Google", async () => {
      process.env.GOOGLE_CLIENT_ID = "test-client-id";
      process.env.GOOGLE_REDIRECT_URI =
        "http://localhost:8080/auth/google/callback";

      const res = await request(app).get("/api/auth/google");
      expect(res.status).toBe(200);
      expect(res.body.url).toContain(
        "https://accounts.google.com/o/oauth2/v2/auth"
      );
      expect(res.body.url).toContain("client_id=test-client-id");

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const stateCookie = cookies.find((c) => c.startsWith("oauth_state="));
      expect(stateCookie).toBeDefined();
    });
  });

  describe("GET /api/auth/:provider/callback", () => {
    it("should return 400 if provider error is returned", async () => {
      const res = await request(app)
        .get("/api/auth/google/callback?error=access_denied")
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("OAuth Error");
      expect(res.body.message).toBe("access_denied");
    });

    it("should return 400 if no authorization code is provided", async () => {
      const res = await request(app)
        .get("/api/auth/google/callback")
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("OAuth Error");
      expect(res.body.message).toBe("no_code_provided");
    });

    it("should return 400 if state mismatch occurs", async () => {
      const res = await request(app)
        .get("/api/auth/google/callback?code=mockcode&state=badstate")
        .set("Cookie", ["oauth_state=goodstate"])
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("OAuth Error");
      expect(res.body.message).toBe("invalid_state");
    });

    it("should successfully process OAuth callback for a new user", async () => {
      const mockProfile = {
        providerId: "google-12345",
        email: "newuser@example.com",
        name: "New User",
        avatarUrl: "https://example.com/photo.jpg",
      };

      const mockUser = {
        _id: "660000000000000000000001",
        name: "New User",
        email: "newuser@example.com",
        role: "CUSTOMER",
        is_verified: true,
        mfaEnabled: false,
        data: () => ({
          userId: "660000000000000000000001",
          name: "New User",
          email: "newuser@example.com",
        }),
      };

      jest
        .spyOn(oauthUtility, "getNormalizedProfile")
        .mockResolvedValue(mockProfile);
      jest
        .spyOn(UserService.prototype, "getUserByProviderId")
        .mockResolvedValue(null);
      jest
        .spyOn(UserService.prototype, "getUserByEmail")
        .mockResolvedValue(null);
      jest
        .spyOn(SubscriptionService.prototype, "createSubscription")
        .mockResolvedValue({
          _id: "660000000000000000000002",
        });
      jest
        .spyOn(UserService.prototype, "createOAuthUser")
        .mockResolvedValue(mockUser);
      jest
        .spyOn(UserSessionService.prototype, "createSession")
        .mockResolvedValue({
          sessionId: "mock-session-uuid-12345",
        });

      const res = await request(app)
        .get("/api/auth/google/callback?code=validcode&state=validstate")
        .set("Cookie", ["oauth_state=validstate"])
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("OAuth login successful");
      expect(res.body.data.user.email).toBe("newuser@example.com");

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const sessionCookie = cookies.find((c) => c.startsWith("sessionId="));
      expect(sessionCookie).toBeDefined();
    });

    it("should successfully link existing user by email on OAuth callback", async () => {
      const mockProfile = {
        providerId: "google-existing-999",
        email: "existing@example.com",
        name: "Existing User",
      };

      const existingUser = {
        _id: "660000000000000000000010",
        name: "Existing User",
        email: "existing@example.com",
        role: "CUSTOMER",
        is_verified: false,
        mfaEnabled: false,
        data: () => ({
          userId: "660000000000000000000010",
          name: "Existing User",
          email: "existing@example.com",
        }),
      };

      jest
        .spyOn(oauthUtility, "getNormalizedProfile")
        .mockResolvedValue(mockProfile);
      jest
        .spyOn(UserService.prototype, "getUserByProviderId")
        .mockResolvedValue(null);
      jest
        .spyOn(UserService.prototype, "getUserByEmail")
        .mockResolvedValue(existingUser);
      jest
        .spyOn(UserService.prototype, "linkProviderId")
        .mockResolvedValue(true);
      jest
        .spyOn(UserSessionService.prototype, "createSession")
        .mockResolvedValue({
          sessionId: "mock-session-uuid-existing",
        });

      const res = await request(app)
        .get("/api/auth/google/callback?code=validcode&state=validstate")
        .set("Cookie", ["oauth_state=validstate"])
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("OAuth login successful");
      expect(UserService.prototype.linkProviderId).toHaveBeenCalledWith(
        existingUser._id,
        "google",
        mockProfile.providerId
      );
    });
  });
});
