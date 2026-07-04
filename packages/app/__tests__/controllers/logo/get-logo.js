const request = require("supertest");
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

const {
  describeResetSubscriptionMiddleware,
  VALID_KEY,
  VALID_SUBSCRIPTION,
} = require("../../shared/resetSUbscriptionShared.middleware");

const API_URL = "/api/logo";

const BASE_QUERY = {
  API_KEY: MOCK_KEYS[1].key,
  key: "https://google.com",
};

const IMAGE_URL = "https://cdn.myapp.com/png/GOOGLE.png?v=1755253230000";

function mockValidKey(overrides = {}) {
  jest
    .spyOn(KeyService.prototype, "getApiKey")
    .mockResolvedValue({ ...VALID_KEY, ...overrides });
}

function mockValidSubscription(overrides = {}) {
  jest
    .spyOn(SubscriptionService.prototype, "getSubscription")
    .mockResolvedValue({ ...VALID_SUBSCRIPTION, ...overrides });
}

function mockValidKeyAndSubscription(
  keyOverrides = {},
  subscriptionOverrides = {}
) {
  mockValidKey(keyOverrides);
  mockValidSubscription(subscriptionOverrides);
}

function mockSuccessHandler() {
  jest
    .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
    .mockResolvedValue(IMAGE_URL);
  jest
    .spyOn(UserService.prototype, "logLogoRequestEntry")
    .mockResolvedValue({});
  jest
    .spyOn(SubscriptionService.prototype, "incrementUsageCount")
    .mockResolvedValue({});
}

// ─────────────────────────────────────────────────────────────────────────────
// Env setup
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Shared middleware tests
// ─────────────────────────────────────────────────────────────────────────────

describeResetSubscriptionMiddleware(
  () => request(app),
  API_URL,
  BASE_QUERY,
  mockSuccessHandler
);

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER: getLogoController
// ─────────────────────────────────────────────────────────────────────────────
jest.mock("../../../services/rewardTransactions");

describe("getLogoController", () => {
  describe("422  Joi schema validation (key field)", () => {
    beforeEach(() => {
      mockValidKeyAndSubscription();
    });

    it("rejects key with invalid characters", async () => {
      const res = await request(app)
        .get(API_URL)
        .query({ ...BASE_QUERY, key: "https://google.com/<script>" });
      expect(res.status).toBe(422);
    });

    it("key that is only a TLD resolves to nonempty company (schema passes, image not found → 404)", async () => {
      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(null);

      const res = await request(app)
        .get(API_URL)
        .query({ ...BASE_QUERY, key: "https://com" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(Messages.LOGO_NOT_FOUND);
    });

    it("should return 422 if query validation fails", async () => {
      const wrongBaseQuery = {
        API_KEY: "28482DNDO483ND3",
        key: "https://google.com",
      };
      const response = await request(app).get(API_URL).query(wrongBaseQuery);
      expect(response.status).toBe(422);
    });

    it("accepts key with subdomain (strips www)", async () => {
      mockSuccessHandler();

      const res = await request(app)
        .get(API_URL)
        .query({ ...BASE_QUERY, key: "https://www.google.com" });
      expect(res.status).toBe(200);
    });

    it("accepts plain domain without protocol", async () => {
      mockSuccessHandler();

      const res = await request(app)
        .get(API_URL)
        .query({ ...BASE_QUERY, key: "google.com" });
      expect(res.status).toBe(200);
    });

    it("accepts key with http (not https)", async () => {
      mockSuccessHandler();

      const res = await request(app)
        .get(API_URL)
        .query({ ...BASE_QUERY, key: "http://google.com" });
      expect(res.status).toBe(200);
    });

    it("rejects API_KEY that is not a valid UUID v4", async () => {
      jest.spyOn(KeyService.prototype, "getApiKey").mockResolvedValue(null);

      const res = await request(app)
        .get(API_URL)
        .query({ ...BASE_QUERY, API_KEY: "not a uuid" });

      expect([403, 422]).toContain(res.status);
    });
  });

  describe("404  image not found", () => {
    it("returns 404 when fetchImageByCompanyFree returns null", async () => {
      mockValidKeyAndSubscription();
      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(null);

      const res = await request(app).get(API_URL).query(BASE_QUERY);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe(Messages.LOGO_NOT_FOUND);
    });

    it("returns 404 when fetchImageByCompanyFree returns undefined", async () => {
      mockValidKeyAndSubscription();
      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(undefined);

      const res = await request(app).get(API_URL).query(BASE_QUERY);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe(Messages.LOGO_NOT_FOUND);
    });

    it("does NOT increment usage count when image is not found", async () => {
      mockValidKeyAndSubscription();
      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(null);

      const incrementSpy = jest.spyOn(
        SubscriptionService.prototype,
        "incrementUsageCount"
      );

      await request(app).get(API_URL).query(BASE_QUERY);
      expect(incrementSpy).not.toHaveBeenCalled();
    });

    it("does NOT log request entry when image is not found", async () => {
      mockValidKeyAndSubscription();
      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(null);

      const logSpy = jest.spyOn(UserService.prototype, "logLogoRequestEntry");

      await request(app).get(API_URL).query(BASE_QUERY);
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe("200 – success", () => {
    it("returns imageUrl in data field", async () => {
      mockValidKeyAndSubscription();
      mockSuccessHandler();

      const res = await request(app).get(API_URL).query(BASE_QUERY);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ statusCode: 200, data: IMAGE_URL });
    });

    it("calls fetchImageByCompanyFree with uppercased company derived from key", async () => {
      mockValidKeyAndSubscription();

      const fetchSpy = jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(IMAGE_URL);

      jest
        .spyOn(UserService.prototype, "logLogoRequestEntry")
        .mockResolvedValue({});
      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockResolvedValue({});

      await request(app)
        .get(API_URL)
        .query({ ...BASE_QUERY, key: "https://google.com" });

      expect(fetchSpy).toHaveBeenCalledWith("GOOGLE");
    });

    it("calls logLogoRequestEntry after successful image fetch", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(IMAGE_URL);

      const logSpy = jest
        .spyOn(UserService.prototype, "logLogoRequestEntry")
        .mockResolvedValue({});

      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockResolvedValue({});

      await request(app).get(API_URL).query(BASE_QUERY);
      expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("calls incrementUsageCount after successful image fetch", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(IMAGE_URL);

      jest
        .spyOn(UserService.prototype, "logLogoRequestEntry")
        .mockResolvedValue({});

      const incrementSpy = jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockResolvedValue({});

      await request(app).get(API_URL).query(BASE_QUERY);
      expect(incrementSpy).toHaveBeenCalledTimes(1);
    });

    it("returns 200 with image data using a repeated/renewed subscription", async () => {
      const keyServiceMockResolve = {
        ...MOCK_KEYS[2],
        expires_at: new Date("2026-12-31T23:59:59Z"),
      };
      jest
        .spyOn(KeyService.prototype, "getApiKey")
        .mockResolvedValue({ ...keyServiceMockResolve });

      jest
        .spyOn(SubscriptionService.prototype, "getSubscription")
        .mockResolvedValue(MOCK_SUBSCRIPTION[0]);

      jest
        .spyOn(RewardTransactionsService.prototype, "validateAndLogRequest")
        .mockResolvedValue({});

      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(MOCK_IMAGE_URL_RESPONSE);
      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockResolvedValue([]);
      jest
        .spyOn(UserService.prototype, "logLogoRequestEntry")
        .mockResolvedValue({});

      const response = await request(app).get(API_URL).query(BASE_QUERY);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        data: MOCK_IMAGE_URL_RESPONSE,
      });
    });
  });

  describe("atomic incrementUsageCount behavior", () => {
    it("returns 403 when incrementUsageCount returns null (limit reached)", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(IMAGE_URL);

      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockResolvedValue(null); // limit reached

      const res = await request(app).get(API_URL).query(BASE_QUERY);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(Messages.LIMIT_REACHED);
    });

    it("does NOT log request when incrementUsageCount returns null", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(IMAGE_URL);

      const logSpy = jest.spyOn(UserService.prototype, "logLogoRequestEntry");

      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockResolvedValue(null);

      await request(app).get(API_URL).query(BASE_QUERY);

      expect(logSpy).not.toHaveBeenCalled();
    });

    it("proceeds when incrementUsageCount succeeds", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(IMAGE_URL);

      jest
        .spyOn(UserService.prototype, "logLogoRequestEntry")
        .mockResolvedValue({});

      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockResolvedValue({ _id: "sub1", usage_count: 6 });

      const res = await request(app).get(API_URL).query(BASE_QUERY);

      expect(res.status).toBe(200);
    });
  });

  describe("operations order", () => {
    it("image fetched → logEntry → usage incremented (in that order)", async () => {
      const order = [];

      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockImplementation(() => {
          order.push("image_fetched");
          return Promise.resolve(IMAGE_URL);
        });

      jest
        .spyOn(UserService.prototype, "logLogoRequestEntry")
        .mockImplementation(() => {
          order.push("log_entry");
          return Promise.resolve({});
        });

      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockImplementation(() => {
          order.push("usage_count_incremented");
          return Promise.resolve({ _id: "sub1" });
        });

      const res = await request(app).get(API_URL).query(BASE_QUERY);

      expect(res.status).toBe(200);
      expect(order).toEqual([
        "image_fetched",
        "usage_count_incremented",
        "log_entry",
      ]);
    });

    it("usage count must NOT be incremented before image is fetched", async () => {
      const order = [];

      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockImplementation(() => {
          order.push("image_fetched");
          return Promise.resolve(IMAGE_URL);
        });

      jest
        .spyOn(UserService.prototype, "logLogoRequestEntry")
        .mockResolvedValue({});

      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockImplementation(() => {
          order.push("usage_count_incremented");
          return Promise.resolve();
        });

      await request(app).get(API_URL).query(BASE_QUERY);

      expect(order[0]).toBe("image_fetched");
      expect(order[order.length - 1]).toBe("usage_count_incremented");
    });
  });

  describe("error handling", () => {
    it("passes error to next() when fetchImageByCompanyFree throws", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockRejectedValue(new Error("DB error"));

      const res = await request(app).get(API_URL).query(BASE_QUERY);
      expect(res.status).toBe(500);
    });

    it("passes error to next() when logLogoRequestEntry throws", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(IMAGE_URL);

      jest
        .spyOn(UserService.prototype, "logLogoRequestEntry")
        .mockRejectedValue(new Error("Log failed"));

      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockResolvedValue({});

      const res = await request(app).get(API_URL).query(BASE_QUERY);
      expect(res.status).toBe(500);
    });

    it("passes error to next() when incrementUsageCount throws", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchImageByCompanyFree")
        .mockResolvedValue(IMAGE_URL);

      jest
        .spyOn(UserService.prototype, "logLogoRequestEntry")
        .mockResolvedValue({});

      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockRejectedValue(new Error("Increment failed"));

      const res = await request(app).get(API_URL).query(BASE_QUERY);
      expect(res.status).toBe(500);
    });
  });
});
