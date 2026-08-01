const AuthService = require("../../services/auth");
const UserService = require("../../services/users");
const SubscriptionService = require("../../services/subscriptions");
const oauth = require("../../utils/oauth");
const {
  AuthProvider,
  OAuthErrorCodes,
  Messages,
} = require("../../utils/constants");
const { MOCK_USERS, MOCK_SUBSCRIPTION } = require("../../utils/mocks");

jest.mock("../../utils/oauth");

describe("AuthService.processOAuthCallback", () => {
  let authService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  it("returns user found by provider ID", async () => {
    const user = {
      ...MOCK_USERS[1],
      googleId: "google-123",
      is_deleted: false,
    };

    oauth.exchangeCodeForProfile.mockResolvedValue({
      id: "google-123",
      email: user.email,
      username: user.name,
      avatar: null,
    });
    jest
      .spyOn(UserService.prototype, "getUserByProviderId")
      .mockResolvedValue(user);

    const result = await authService.processOAuthCallback(
      AuthProvider.GOOGLE,
      "code"
    );

    expect(result).toEqual(user);
    expect(UserService.prototype.getUserByProviderId).toHaveBeenCalledWith(
      AuthProvider.GOOGLE,
      "google-123"
    );
  });

  it("throws account_deleted when provider ID user is soft-deleted", async () => {
    const user = {
      ...MOCK_USERS[1],
      googleId: "google-123",
      is_deleted: true,
    };

    oauth.exchangeCodeForProfile.mockResolvedValue({
      id: "google-123",
      email: user.email,
      username: user.name,
      avatar: null,
    });
    jest
      .spyOn(UserService.prototype, "getUserByProviderId")
      .mockResolvedValue(user);

    await expect(
      authService.processOAuthCallback(AuthProvider.GOOGLE, "code")
    ).rejects.toMatchObject({
      code: OAuthErrorCodes.ACCOUNT_DELETED,
      message: Messages.ACCOUNT_DELETED,
    });
  });

  it("links provider ID when user is found by email", async () => {
    const user = {
      ...MOCK_USERS[1],
      authProvider: AuthProvider.LOCAL,
      is_deleted: false,
    };
    const linkedUser = { ...user, googleId: "google-123" };

    oauth.exchangeCodeForProfile.mockResolvedValue({
      id: "google-123",
      email: user.email,
      username: user.name,
      avatar: null,
    });
    jest
      .spyOn(UserService.prototype, "getUserByProviderId")
      .mockResolvedValue(null);
    jest.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(user);
    jest
      .spyOn(UserService.prototype, "linkOAuthProvider")
      .mockResolvedValue(linkedUser);
    jest.spyOn(UserService.prototype, "getUser").mockResolvedValue(linkedUser);

    const result = await authService.processOAuthCallback(
      AuthProvider.GOOGLE,
      "code"
    );

    expect(UserService.prototype.linkOAuthProvider).toHaveBeenCalledWith(
      user._id,
      AuthProvider.GOOGLE,
      "google-123"
    );
    expect(result.googleId).toBe("google-123");
  });

  it("creates a new verified OAuth user when no match exists", async () => {
    const profile = {
      id: "discord-999",
      email: "oauth@example.com",
      username: "OAuth User",
      avatar: null,
    };
    const createdUser = {
      ...MOCK_USERS[1],
      email: profile.email,
      name: profile.username,
      discordId: profile.id,
      authProvider: AuthProvider.DISCORD,
      is_verified: true,
    };

    oauth.exchangeCodeForProfile.mockResolvedValue(profile);
    jest
      .spyOn(UserService.prototype, "getUserByProviderId")
      .mockResolvedValue(null);
    jest.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(null);
    jest
      .spyOn(SubscriptionService.prototype, "createSubscription")
      .mockResolvedValue(MOCK_SUBSCRIPTION[0]);
    jest
      .spyOn(UserService.prototype, "createOAuthUser")
      .mockResolvedValue(createdUser);

    const result = await authService.processOAuthCallback(
      AuthProvider.DISCORD,
      "code"
    );

    expect(UserService.prototype.createOAuthUser).toHaveBeenCalledWith({
      email: profile.email,
      name: profile.username,
      provider: AuthProvider.DISCORD,
      providerId: profile.id,
      subscription_id: MOCK_SUBSCRIPTION[0]._id,
    });
    expect(result).toEqual(createdUser);
  });

  it("throws no_email_provided when profile has no email", async () => {
    oauth.exchangeCodeForProfile.mockRejectedValue(
      Object.assign(new Error(Messages.NO_EMAIL_PROVIDED), {
        code: OAuthErrorCodes.NO_EMAIL_PROVIDED,
      })
    );

    await expect(
      authService.processOAuthCallback(AuthProvider.GITHUB, "code")
    ).rejects.toMatchObject({
      code: OAuthErrorCodes.NO_EMAIL_PROVIDED,
    });
  });
});
