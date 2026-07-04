const request = require("supertest");
const { STATUS_CODES } = require("node:http");
const app = require("../../../server");
const { Messages } = require("../../../utils/constants");
const {
  MOCK_KEYS,
  MOCK_SUBSCRIPTION,
  MOCK_IMAGE_URL_RESPONSE,
} = require("../../../utils/mocks");

const {
  ImageService,
  KeyService,
  SubscriptionService,
  UserService,
  RewardTransactionsService,
} = require("../../../services");

jest.mock("../../../services/rewardTransactions");

describe("getLogoController", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "Your_JWT_SECRET";
    process.env.CLIENT_PROXY_URL = "http://localhost:3000";
    process.env.KEY = "logos";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_PROXY_URL;
    delete process.env.KEY;
  });

  const apiUrl = "/api/logo";

  const baseQuery = {
    API_KEY: MOCK_KEYS[1].key,
    key: "https://google.com",
  };

  const mockSubscription = [MOCK_SUBSCRIPTION[0], MOCK_SUBSCRIPTION[1]];

  function mockRepeatedService(mockSubscription) {
    const keyServiceMockResolve = {
      ...MOCK_KEYS[2],
      expires_at: new Date("2026-12-31T23:59:59Z"),
    };
    jest
      .spyOn(KeyService.prototype, "getApiKey")
      .mockResolvedValue({ ...keyServiceMockResolve });

    jest
      .spyOn(SubscriptionService.prototype, "getSubscription")
      .mockResolvedValue(mockSubscription);

    jest
      .spyOn(RewardTransactionsService.prototype, "validateAndLogRequest")
      .mockResolvedValue({});
  }

  it("should return 422 if query validation fails", async () => {
    const wrongBaseQuery = {
      API_KEY: "28482DNDO483ND3",
      key: "https://google.com",
    };
    const response = await request(app).get(apiUrl).query(wrongBaseQuery);
    expect(response.status).toBe(422);
  });

  it("if API key is invalid it should return 403", async () => {
    jest.spyOn(KeyService.prototype, "getApiKey").mockResolvedValue(null);

    const response = await request(app).get(apiUrl).query(baseQuery);
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: Messages.INVALID_KEY,
      statusCode: 403,
      error: STATUS_CODES[403],
    });
  });

  it("if API_KEY does not have `expires_at` it should return 403", async () => {
    jest
      .spyOn(KeyService.prototype, "getApiKey")
      .mockResolvedValue(MOCK_KEYS[0]);

    const response = await request(app).get(apiUrl).query(baseQuery);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: Messages.UPDATE_API_KEY,
      statusCode: 403,
      error: STATUS_CODES[403],
    });
  });

  it("if API_KEY is expired it should return 403", async () => {
    const expiredKeyMock = {
      ...MOCK_KEYS[0],
      expires_at: new Date(Date.now() - 86400000),
    };

    jest
      .spyOn(KeyService.prototype, "getApiKey")
      .mockResolvedValue(expiredKeyMock);

    const response = await request(app).get(apiUrl).query(baseQuery);
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: Messages.API_KEY_EXPIRED,
      statusCode: 403,
      error: STATUS_CODES[403],
    });
  });

  it("if limit reached it should return 403", async () => {
    mockRepeatedService(mockSubscription[1]);

    const response = await request(app).get(apiUrl).query(baseQuery);
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: Messages.LIMIT_REACHED,
      statusCode: 403,
      error: STATUS_CODES[403],
    });
  });

  it("if image not found it should return 404", async () => {
    mockRepeatedService(mockSubscription[0]);

    jest
      .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
      .mockResolvedValue(null);

    jest
      .spyOn(SubscriptionService.prototype, "incrementUsageCount")
      .mockResolvedValue([]);

    const response = await request(app).get(apiUrl).query(baseQuery);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: Messages.LOGO_NOT_FOUND,
      statusCode: 404,
      error: STATUS_CODES[404],
    });
  });

  it("200-images returned", async () => {
    mockRepeatedService(mockSubscription[0]);

    jest
      .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
      .mockResolvedValue(MOCK_IMAGE_URL_RESPONSE);
    jest
      .spyOn(SubscriptionService.prototype, "incrementUsageCount")
      .mockResolvedValue([]);
    jest
      .spyOn(UserService.prototype, "logLogoRequestEntry")
      .mockResolvedValue({});
    const response = await request(app).get(apiUrl).query(baseQuery);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: MOCK_IMAGE_URL_RESPONSE,
    });
  });
});

describe("getLogoController - Operations Order Test", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "Your_JWT_SECRET";
    process.env.CLIENT_PROXY_URL = "http://localhost:3000";
    process.env.KEY = "logos";
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_PROXY_URL;
    delete process.env.KEY;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const apiUrl = "/api/logo";

  it("should ensure image is fetched before usage count is incremented - operations order test", async () => {
    const operationsOrder = [];

    const mockKeyRef = {
      subscription_id: "test_subscription_id",
      ...MOCK_KEYS[0],
      expires_at: new Date("2026-12-31T23:59:59Z"),
    };

    jest.spyOn(KeyService.prototype, "getApiKey").mockResolvedValue(mockKeyRef);

    const mockSubscription = {
      usage_count: 5,
      usage_limit: 100,
      ...MOCK_SUBSCRIPTION[0],
    };

    jest
      .spyOn(SubscriptionService.prototype, "getSubscription")
      .mockResolvedValue(mockSubscription);

    jest
      .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
      .mockImplementation(() => {
        operationsOrder.push("image_fetched");
        return MOCK_IMAGE_URL_RESPONSE;
      });

    jest
      .spyOn(UserService.prototype, "logLogoRequestEntry")
      .mockResolvedValue({});

    jest
      .spyOn(SubscriptionService.prototype, "incrementUsageCount")
      .mockImplementation(() => {
        operationsOrder.push("usage_count_incremented");
        return Promise.resolve();
      });

    const baseQuery = {
      API_KEY: MOCK_KEYS[1].key,
      key: "https://google.com",
    };

    const response = await request(app).get(apiUrl).query(baseQuery);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: MOCK_IMAGE_URL_RESPONSE,
    });

    expect(operationsOrder).toEqual([
      "image_fetched",
      "usage_count_incremented",
    ]);
    expect(operationsOrder[0]).toBe("image_fetched");
    expect(operationsOrder[1]).toBe("usage_count_incremented");
  });
});
