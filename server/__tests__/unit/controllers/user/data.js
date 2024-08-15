const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");

const { Users, Subscriptions, Keys } = require("../../../../models");
const { mockUsers } = require("../../../../utils/mocks/Users");
const { mockSubscriptions } = require("../../../../utils/mocks/Subscriptions");
const { mockKeys } = require("../../../../utils/mocks/Keys");

const mockUserModel = new Users(mockUsers[0]);
const {
  SubscriptionService,
  KeyService,
  UserService,
} = require("../../../../services");

jest.mock("../../../../services/Users", () => ({
  fetchUserFromId: jest.fn(),
}));
jest.mock("../../../../services/Subscriptions", () => ({
  fetchSubscriptionByuserid: jest.fn(),
}));
jest.mock("../../../../services/Keys", () => ({
  fetchKeysByuserid: jest.fn(),
}));

const ENDPOINT = "/api/user/data";

describe("GET - /user/data", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
    process.env.CLIENT_PROXY_URL = "http://validcorsorigin.com";
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_PROXY_URL;
  });

  it("500 - Not allowed by CORS", async () => {
    const response = await request(app)
      .get(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("500 - Unexpected error", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(() => {
      throw new Error("error");
    });

    const response = await request(app)
      .get(ENDPOINT)
      .set("Cookie", `jwt=${mockToken}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "error",
      statusCode: 500,
    });
  });

  it("200 - Success", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockSubscriptionModel = new Subscriptions(mockSubscriptions[0]);
    const mockKeyModel = new Keys(mockKeys[0]);

    jest.spyOn(UserService, "fetchUserFromId").mockResolvedValue(mockUserModel);
    jest.spyOn(SubscriptionService, "fetchSubscriptionByuserid").mockResolvedValue(mockSubscriptionModel);
    jest.spyOn(KeyService, "fetchKeysByuserid").mockResolvedValue([mockKeyModel]);

    const response = await request(app)
      .get(ENDPOINT)
      .set("Cookie", `jwt=${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      email: mockUserModel.email,
      firstName: mockUserModel.firstName,
      lastName: mockUserModel.lastName,
      userId: mockUserModel._id.toString(),
      userType: mockUserModel.userType,
      subscription: {
        _id: mockSubscriptionModel._id.toString(),
        subscriptionType: mockSubscriptionModel.subscriptionType,
        user: mockSubscriptionModel.user.toString(),
        isActive: mockSubscriptionModel.isActive,
        usageLimit: mockSubscriptionModel.usageLimit,
        keyLimit: mockSubscriptionModel.keyLimit,
        usageCount: mockSubscriptionModel.usageCount,
        createdAt: mockSubscriptionModel.createdAt.toISOString(),
        updatedAt: mockSubscriptionModel.updatedAt.toISOString(),
      },
      keys: [
        {
          _id: mockKeyModel._id.toString(),
          user: mockKeyModel.user.toString(),
          key: mockKeyModel.key,
          keyDescription: mockKeyModel.keyDescription,
          createdAt: mockKeyModel.createdAt.toISOString(),
          updatedAt: mockKeyModel.updatedAt.toISOString(),
        },
      ],
    });
  });

  it("404 - User document not found", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest.spyOn(UserService, "fetchUserFromId").mockResolvedValue(null);

    const response = await request(app)
      .get(ENDPOINT)
      .set("Cookie", `jwt=${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      error: STATUS_CODES[404],
      message: "User document not found",
    });
  });

  it("206 - Subscription and key not found", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest.spyOn(UserService, "fetchUserFromId").mockResolvedValue(mockUserModel);
    jest.spyOn(SubscriptionService, "fetchSubscriptionByuserid").mockResolvedValue(null);
    jest.spyOn(KeyService, "fetchKeysByuserid").mockResolvedValue([]);

    const response = await request(app)
      .get(ENDPOINT)
      .set("Cookie", `jwt=${mockToken}`);

    expect(response.status).toBe(206);
    expect(response.body.data).toEqual({
      email: mockUserModel.email,
      firstName: mockUserModel.firstName,
      lastName: mockUserModel.lastName,
      userId: mockUserModel._id.toString(),
      userType: mockUserModel.userType,
      keys: [],
    });
  });
});
