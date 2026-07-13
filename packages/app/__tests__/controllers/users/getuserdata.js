const request = require("supertest");
const { STATUS_CODES } = require("http");
const {
  UserService,
  SubscriptionService,
  KeyService,
  UserSessionService,
} = require("../../../services");
const {
  MOCK_USERS,
  MOCK_SUBSCRIPTION,
  MOCK_KEYS,
  MOCK_SESSION_ID,
  MOCK_USER_SESSIONS,
} = require("../../../utils/mocks");
const { Keys, Subscriptions, Users } = require("../../../models");
const { Messages } = require("../../../utils/constants");
const app = require("../../../server");

describe("GETUSERDATA", () => {
  beforeAll(() => {
    process.env.CLIENT_PROXY_URL = "https://validcorsorigin.com";
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    delete process.env.CLIENT_PROXY_URL;
  });

  it("404 - User not found", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[0]);
    jest.spyOn(UserService.prototype, "getUser").mockResolvedValue(null);

    const response = await request(app)
      .get("/api/user/me")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      error: STATUS_CODES[404],
      message: Messages.USER_NOT_FOUND,
    });
  });

  it("206 - User data not found", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[0]);
    jest
      .spyOn(UserService.prototype, "getUser")
      .mockResolvedValue(MOCK_USERS[1]);
    jest
      .spyOn(SubscriptionService.prototype, "getSubscription")
      .mockResolvedValue(null);
    jest.spyOn(KeyService.prototype, "getAllUserKeys").mockResolvedValue(null);

    const response = await request(app)
      .get("/api/user/me")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(206);
    expect(response.body).toEqual({
      statusCode: 206,
      error: STATUS_CODES[206],
      message: Messages.DATA_NOT_FOUND,
    });
  });

  it("500 - Unexpected Error", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[0]);
    jest.spyOn(UserService.prototype, "getUser").mockImplementation(() => {
      throw new Error();
    });

    const response = await request(app)
      .get("/api/user/me")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(500);
  });

  it("200 - Success", async () => {
    const mockUserModel = new Users(MOCK_USERS[1]);
    const mockSubscriptionModel = new Subscriptions(MOCK_SUBSCRIPTION[0]);
    const mockKeyModel = new Keys(MOCK_KEYS[2]);
    jest
      .spyOn(UserService.prototype, "getUser")
      .mockResolvedValue(mockUserModel);
    jest
      .spyOn(SubscriptionService.prototype, "getSubscription")
      .mockResolvedValue(mockSubscriptionModel);
    jest.spyOn(KeyService.prototype, "getAllUserKeys").mockResolvedValue([
      {
        _id: mockKeyModel._id.toString(),
        key_description: mockKeyModel.key_description,
        subscription_id: mockKeyModel.subscription_id,
        created_at: mockKeyModel._id.getTimestamp().toISOString(),
        updated_at: mockKeyModel.updated_at.toISOString(),
        expires_at: mockKeyModel.expires_at.toISOString(),
      },
    ]);

    const response = await request(app)
      .get("/api/user/me")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      email: mockUserModel.email,
      name: mockUserModel.name,
      userId: mockUserModel._id.toString(),
      role: mockUserModel.role,
      subscription_id: mockUserModel.subscription_id.toString(),
      is_deleted: mockUserModel.is_deleted,
      is_verified: mockUserModel.is_verified,
      created_at: mockUserModel._id.getTimestamp().toISOString(),
      updated_at: mockUserModel.updated_at.toISOString(),
      reward_points_current: mockUserModel.reward_points_current,
      reward_points_lifetime: mockUserModel.reward_points_lifetime,
      subscription: {
        _id: mockSubscriptionModel._id.toString(),
        is_active: mockSubscriptionModel.is_active,
        usage_limit: mockSubscriptionModel.usage_limit,
        key_limit: mockSubscriptionModel.key_limit,
        usage_count: mockSubscriptionModel.usage_count,
        type: mockSubscriptionModel.type,
        updated_at: mockSubscriptionModel.updated_at.toISOString(),
      },
      keys: [
        {
          _id: mockKeyModel._id.toString(),
          created_at: mockKeyModel._id.getTimestamp().toISOString(),
          updated_at: mockKeyModel.updated_at.toISOString(),
          expires_at: mockKeyModel.expires_at.toISOString(),
        },
      ],
    });
  });
});
