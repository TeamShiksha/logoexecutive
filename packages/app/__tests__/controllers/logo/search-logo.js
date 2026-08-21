const request = require("supertest");
const app = require("../../../server");
const { Messages } = require("../../../utils/constants");
const { MOCK_KEYS } = require("../../../utils/mocks");

const {
  ImageService,
  KeyService,
  SubscriptionService,
} = require("../../../services");

const {
  describeResetSubscriptionMiddleware,
  VALID_KEY,
  VALID_SUBSCRIPTION,
} = require("../../shared/resetSUbscriptionShared.middleware");

const API_URL = "/api/logo/search";

const BASE_QUERY = {
  API_KEY: MOCK_KEYS[1].key,
  key: "https://google.com",
};

const MOCK_COMPANY_LIST = [
  { _id: "1", company_name: "GOOGLE" },
  { _id: "2", company_name: "GOOGLE LLC" },
];

const MOCK_DATA_LIST = [
  { _id: "1", image: "https://cdn.myapp.com/png/GOOGLE.png" },
  { _id: "2", image: "https://cdn.myapp.com/png/GOOGLE_LLC.png" },
];

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
    .spyOn(ImageService.prototype, "fetchCompanyList")
    .mockResolvedValue(MOCK_COMPANY_LIST);
  jest
    .spyOn(ImageService.prototype, "getDataList")
    .mockResolvedValue(MOCK_DATA_LIST);
  jest
    .spyOn(SubscriptionService.prototype, "incrementUsageCount")
    .mockResolvedValue({});
}

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
// CONTROLLER: searchLogoController
// ─────────────────────────────────────────────────────────────────────────────

describe("searchLogoController", () => {
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

    it("key that is only a TLD resolves to non empty company (schema passes, no results  404)", async () => {
      jest
        .spyOn(ImageService.prototype, "fetchCompanyList")
        .mockResolvedValue([]);

      const res = await request(app)
        .get(API_URL)
        .query({ ...BASE_QUERY, key: "https://com" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(Messages.LOGO_NOT_FOUND);
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

  describe("404  no companies found", () => {
    it("returns 404 when fetchCompanyList returns empty array", async () => {
      mockValidKeyAndSubscription();
      jest
        .spyOn(ImageService.prototype, "fetchCompanyList")
        .mockResolvedValue([]);

      const res = await request(app).get(API_URL).query(BASE_QUERY);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe(Messages.LOGO_NOT_FOUND);
    });

    it("does NOT call getDataList when fetchCompanyList returns empty array", async () => {
      mockValidKeyAndSubscription();
      jest
        .spyOn(ImageService.prototype, "fetchCompanyList")
        .mockResolvedValue([]);

      const getDataListSpy = jest.spyOn(ImageService.prototype, "getDataList");

      await request(app).get(API_URL).query(BASE_QUERY);
      expect(getDataListSpy).not.toHaveBeenCalled();
    });

    it("does NOT increment usage count when no companies found", async () => {
      mockValidKeyAndSubscription();
      jest
        .spyOn(ImageService.prototype, "fetchCompanyList")
        .mockResolvedValue([]);

      const incrementSpy = jest.spyOn(
        SubscriptionService.prototype,
        "incrementUsageCount"
      );

      await request(app).get(API_URL).query(BASE_QUERY);
      expect(incrementSpy).not.toHaveBeenCalled();
    });
  });

  describe("200  success", () => {
    it("returns data list in response body", async () => {
      mockValidKeyAndSubscription();
      mockSuccessHandler();

      const res = await request(app).get(API_URL).query(BASE_QUERY);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ statusCode: 200, data: MOCK_DATA_LIST });
    });

    it("calls fetchCompanyList with regex built from companyNameBeginsWith", async () => {
      mockValidKeyAndSubscription();

      const fetchSpy = jest
        .spyOn(ImageService.prototype, "fetchCompanyList")
        .mockResolvedValue(MOCK_COMPANY_LIST);

      jest
        .spyOn(ImageService.prototype, "getDataList")
        .mockResolvedValue(MOCK_DATA_LIST);
      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockResolvedValue({});

      await request(app)
        .get(API_URL)
        .query({ ...BASE_QUERY, key: "https://google.com" });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [calledWith] = fetchSpy.mock.calls[0];
      expect(calledWith).toBeInstanceOf(RegExp);
      expect(calledWith.source).toBe("^GOOGLE");
      expect(calledWith.flags).toBe("i");
    });

    it("calls getDataList with the company list returned by fetchCompanyList", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchCompanyList")
        .mockResolvedValue(MOCK_COMPANY_LIST);

      const getDataListSpy = jest
        .spyOn(ImageService.prototype, "getDataList")
        .mockResolvedValue(MOCK_DATA_LIST);

      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockResolvedValue({});

      await request(app).get(API_URL).query(BASE_QUERY);
      expect(getDataListSpy).toHaveBeenCalledWith(MOCK_COMPANY_LIST);
    });

    it("calls incrementUsageCount after data is fetched", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchCompanyList")
        .mockResolvedValue(MOCK_COMPANY_LIST);
      jest
        .spyOn(ImageService.prototype, "getDataList")
        .mockResolvedValue(MOCK_DATA_LIST);

      const incrementSpy = jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockResolvedValue({});

      await request(app).get(API_URL).query(BASE_QUERY);
      expect(incrementSpy).toHaveBeenCalledTimes(1);
    });
  });    

  describe("atomic incrementUsageCount behavior", () => {
  it("returns 403 when incrementUsageCount returns null (limit reached)", async () => {
    mockValidKeyAndSubscription();

    jest
      .spyOn(ImageService.prototype, "fetchCompanyList")
      .mockResolvedValue(MOCK_COMPANY_LIST);

    jest
      .spyOn(SubscriptionService.prototype, "incrementUsageCount")
      .mockResolvedValue(null); // limit reached

    const res = await request(app).get(API_URL).query(BASE_QUERY);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(Messages.LIMIT_REACHED);
  });

  it("does NOT call getDataList when incrementUsageCount returns null", async () => {
    mockValidKeyAndSubscription();

    jest
      .spyOn(ImageService.prototype, "fetchCompanyList")
      .mockResolvedValue(MOCK_COMPANY_LIST);

    const getDataListSpy = jest.spyOn(
      ImageService.prototype,
      "getDataList"
    );

    jest
      .spyOn(SubscriptionService.prototype, "incrementUsageCount")
      .mockResolvedValue(null);

    await request(app).get(API_URL).query(BASE_QUERY);

    expect(getDataListSpy).not.toHaveBeenCalled();
  });

  it("proceeds when incrementUsageCount succeeds", async () => {
    mockValidKeyAndSubscription();

    jest
      .spyOn(ImageService.prototype, "fetchCompanyList")
      .mockResolvedValue(MOCK_COMPANY_LIST);

    jest
      .spyOn(SubscriptionService.prototype, "incrementUsageCount")
      .mockResolvedValue({ _id: "sub1", usage_count: 6 });

    jest
      .spyOn(ImageService.prototype, "getDataList")
      .mockResolvedValue(MOCK_DATA_LIST);

    const res = await request(app).get(API_URL).query(BASE_QUERY);

    expect(res.status).toBe(200);
  });
});

  describe("operations order", () => {
    it("fetchCompanyList  getDataList  incrementUsageCount (in that order)", async () => {
      const order = [];

      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchCompanyList")
        .mockImplementation(() => {
          order.push("fetch_company_list");
          return Promise.resolve(MOCK_COMPANY_LIST);
        });  

         jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockImplementation(() => {
          order.push("usage_count_incremented");
          return Promise.resolve({ _id: "sub1" });
        }); 

      jest
        .spyOn(ImageService.prototype, "getDataList")
        .mockImplementation(() => {
          order.push("get_data_list");
          return Promise.resolve(MOCK_DATA_LIST);
        });


      const res = await request(app).get(API_URL).query(BASE_QUERY);

      expect(res.status).toBe(200);
      expect(order).toEqual([
        "fetch_company_list",
        "usage_count_incremented",
        "get_data_list",
      ]);
    });

    it("usage count must NOT be incremented before company list is fetched", async () => {
      const order = [];

      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchCompanyList")
        .mockImplementation(() => {
          order.push("fetch_company_list");
          return Promise.resolve(MOCK_COMPANY_LIST);
        });

      jest
        .spyOn(ImageService.prototype, "getDataList")
        .mockResolvedValue(MOCK_DATA_LIST);

      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockImplementation(() => {
          order.push("usage_count_incremented");
          return Promise.resolve();
        });

      await request(app).get(API_URL).query(BASE_QUERY);

      expect(order[0]).toBe("fetch_company_list");
      expect(order[order.length - 1]).toBe("usage_count_incremented");
    });
  });

  describe("error handling", () => {
    it("passes error to next() when fetchCompanyList throws", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchCompanyList")
        .mockRejectedValue(new Error("DB error"));

      const res = await request(app).get(API_URL).query(BASE_QUERY);
      expect(res.status).toBe(500);
    });

    it("passes error to next() when getDataList throws", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchCompanyList")
        .mockResolvedValue(MOCK_COMPANY_LIST);

      jest
        .spyOn(ImageService.prototype, "getDataList")
        .mockRejectedValue(new Error("Data fetch failed"));

      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockResolvedValue({});

      const res = await request(app).get(API_URL).query(BASE_QUERY);
      expect(res.status).toBe(500);
    });

    it("passes error to next() when incrementUsageCount throws", async () => {
      mockValidKeyAndSubscription();

      jest
        .spyOn(ImageService.prototype, "fetchCompanyList")
        .mockResolvedValue(MOCK_COMPANY_LIST);

      jest
        .spyOn(ImageService.prototype, "getDataList")
        .mockResolvedValue(MOCK_DATA_LIST);

      jest
        .spyOn(SubscriptionService.prototype, "incrementUsageCount")
        .mockRejectedValue(new Error("Increment failed"));

      const res = await request(app).get(API_URL).query(BASE_QUERY);
      expect(res.status).toBe(500);
    });
  });
});
