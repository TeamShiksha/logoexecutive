const { Messages } = require("../../utils/constants");
const { MOCK_KEYS, MOCK_SUBSCRIPTION } = require("../../utils/mocks");
const { KeyService, SubscriptionService } = require("../../services");

const VALID_KEY = {
  ...MOCK_KEYS[2],
  subscription_id: "sub_id",
  expires_at: new Date("2026-12-31T23:59:59Z"),
};

const VALID_SUBSCRIPTION = {
  ...MOCK_SUBSCRIPTION[0],
  usage_count: 5,
  usage_limit: 100,
  end_date: new Date("2026-12-31T23:59:59Z"),
};

/**
 * Shared test suite for the resetSubscription middleware.
 *
 * @param {function} getApp         - returns the supertest `request(app)` instance
 * @param {string}   apiUrl         - the route under test  e.g. "/api/logo"
 * @param {object}   baseQuery      - valid query that passes middleware  e.g. { API_KEY, key }
 * @param {function} mockSuccessHandler - mocks whatever the controller needs to return 200
 *                                       so we can verify middleware passes through correctly
 */
function describeResetSubscriptionMiddleware(
  getApp,
  apiUrl,
  baseQuery,
  mockSuccessHandler
) {
  describe("resetSubscription middleware (shared)", () => {
    // ── Query validation ────────────────────────────────────────────────────

    describe("422 – missing query params", () => {
      it("no params at all", async () => {
        const res = await getApp().get(apiUrl);
        expect(res.status).toBe(422);
      });

      it("missing key", async () => {
        const res = await getApp()
          .get(apiUrl)
          .query({ API_KEY: baseQuery.API_KEY });
        expect(res.status).toBe(422);
      });

      it("missing API_KEY", async () => {
        const res = await getApp().get(apiUrl).query({ key: baseQuery.key });
        expect(res.status).toBe(422);
      });
    });

    // ── API key checks ──────────────────────────────────────────────────────

    describe("403 – API key validation", () => {
      it("invalid (null) API key", async () => {
        jest.spyOn(KeyService.prototype, "getApiKey").mockResolvedValue(null);

        const res = await getApp().get(apiUrl).query(baseQuery);
        expect(res.status).toBe(403);
        expect(res.body.message).toBe(Messages.INVALID_KEY);
      });

      it("API key with missing expires_at (null)", async () => {
        jest.spyOn(KeyService.prototype, "getApiKey").mockResolvedValue({
          ...MOCK_KEYS[0],
          expires_at: null,
        });

        const res = await getApp().get(apiUrl).query(baseQuery);
        expect(res.status).toBe(403);
        expect(res.body.message).toBe(Messages.UPDATE_API_KEY);
      });

      it("API key with missing expires_at (undefined)", async () => {
        jest.spyOn(KeyService.prototype, "getApiKey").mockResolvedValue({
          ...MOCK_KEYS[0],
          expires_at: undefined,
        });

        const res = await getApp().get(apiUrl).query(baseQuery);
        expect(res.status).toBe(403);
        expect(res.body.message).toBe(Messages.UPDATE_API_KEY);
      });

      it("expired API key", async () => {
        jest.spyOn(KeyService.prototype, "getApiKey").mockResolvedValue({
          ...MOCK_KEYS[0],
          expires_at: new Date(Date.now() - 10_000),
        });

        const res = await getApp().get(apiUrl).query(baseQuery);
        expect(res.status).toBe(403);
        expect(res.body.message).toBe(Messages.API_KEY_EXPIRED);
      });

      it("API key expiring exactly now is treated as expired", async () => {
        jest.spyOn(KeyService.prototype, "getApiKey").mockResolvedValue({
          ...MOCK_KEYS[0],
          expires_at: new Date(Date.now() - 1),
        });

        const res = await getApp().get(apiUrl).query(baseQuery);
        expect(res.status).toBe(403);
        expect(res.body.message).toBe(Messages.API_KEY_EXPIRED);
      });
    });

    // ── Subscription checks ─────────────────────────────────────────────────

    describe("403 – subscription validation", () => {
      it("usage limit reached (count === limit)", async () => {
        jest
          .spyOn(KeyService.prototype, "getApiKey")
          .mockResolvedValue(VALID_KEY);
        jest
          .spyOn(SubscriptionService.prototype, "getSubscription")
          .mockResolvedValue({
            ...VALID_SUBSCRIPTION,
            usage_count: 100,
            usage_limit: 100,
          });
        const res = await getApp().get(apiUrl).query(baseQuery);
        expect(res.status).toBe(403);
        expect(res.body.message).toBe(Messages.LIMIT_REACHED);
      });

      it("usage count exceeds limit", async () => {
        jest
          .spyOn(KeyService.prototype, "getApiKey")
          .mockResolvedValue(VALID_KEY);
        jest
          .spyOn(SubscriptionService.prototype, "getSubscription")
          .mockResolvedValue({
            ...VALID_SUBSCRIPTION,
            usage_count: 110,
            usage_limit: 100,
          });

        const res = await getApp().get(apiUrl).query(baseQuery);
        expect(res.status).toBe(403);
        expect(res.body.message).toBe(Messages.LIMIT_REACHED);
      });
    });

    // ── Subscription auto-reset flow ────────────────────────────────────────

    describe("subscription auto reset when end_date passed or existing user migration for start_date and end_date", () => {
      it("resets subscription when start_date and end_date are missing (migration case)", async () => {
        jest
          .spyOn(KeyService.prototype, "getApiKey")
          .mockResolvedValue(VALID_KEY);

        const missingDatesSubscription = {
          ...VALID_SUBSCRIPTION,
          start_date: undefined,
          end_date: undefined,
          usage_count: 40,
        };

        const refreshedSubscription = {
          ...VALID_SUBSCRIPTION,
          start_date: new Date(),
          end_date: new Date("2027-01-01T00:00:00Z"),
          usage_count: 40, // should remain unchanged for migration
        };

        const getSubscriptionSpy = jest
          .spyOn(SubscriptionService.prototype, "getSubscription")
          .mockResolvedValueOnce(missingDatesSubscription)
          .mockResolvedValueOnce(refreshedSubscription);

        const resetSpy = jest
          .spyOn(SubscriptionService.prototype, "resetLimitAndExpiryDate")
          .mockResolvedValue({});

        mockSuccessHandler();

        const res = await getApp().get(apiUrl).query(baseQuery);

        expect(resetSpy).toHaveBeenCalledTimes(1);
        expect(getSubscriptionSpy).toHaveBeenCalledTimes(2);
        expect(res.status).toBe(200);
      });

      it("resets and re fetches subscription when end_date is in the past, then proceeds", async () => {
        jest
          .spyOn(KeyService.prototype, "getApiKey")
          .mockResolvedValue(VALID_KEY);

        const expiredSubscription = {
          ...VALID_SUBSCRIPTION,
          end_date: new Date(Date.now() - 10_000),
          usage_count: 50,
        };

        const refreshedSubscription = {
          ...VALID_SUBSCRIPTION,
          end_date: new Date("2027-01-01T00:00:00Z"),
          usage_count: 0,
        };

        const getSubscriptionSpy = jest
          .spyOn(SubscriptionService.prototype, "getSubscription")
          .mockResolvedValueOnce(expiredSubscription)
          .mockResolvedValueOnce(refreshedSubscription);

        const resetSpy = jest
          .spyOn(SubscriptionService.prototype, "resetLimitAndExpiryDate")
          .mockResolvedValue({});

        mockSuccessHandler();

        const res = await getApp().get(apiUrl).query(baseQuery);

        expect(resetSpy).toHaveBeenCalledTimes(1);
        expect(getSubscriptionSpy).toHaveBeenCalledTimes(2);
        expect(res.status).toBe(200);
      });

      it("after reset, if usage still at limit, returns 403", async () => {
        jest
          .spyOn(KeyService.prototype, "getApiKey")
          .mockResolvedValue(VALID_KEY);

        const expiredSubscription = {
          ...VALID_SUBSCRIPTION,
          end_date: new Date(Date.now() - 10_000),
        };

        const stillAtLimitSubscription = {
          ...VALID_SUBSCRIPTION,
          usage_count: 100,
          usage_limit: 100,
          end_date: new Date("2027-01-01T00:00:00Z"),
        };

        jest
          .spyOn(SubscriptionService.prototype, "getSubscription")
          .mockResolvedValueOnce(expiredSubscription)
          .mockResolvedValueOnce(stillAtLimitSubscription);

        jest
          .spyOn(SubscriptionService.prototype, "resetLimitAndExpiryDate")
          .mockResolvedValue({});

        const res = await getApp().get(apiUrl).query(baseQuery);
        expect(res.status).toBe(403);
        expect(res.body.message).toBe(Messages.LIMIT_REACHED);
      });
    });

    // ── Error propagation ───────────────────────────────────────────────────

    describe("error handling", () => {
      it("passes error to next() when getApiKey throws", async () => {
        jest
          .spyOn(KeyService.prototype, "getApiKey")
          .mockRejectedValue(new Error("DB connection error"));

        const res = await getApp().get(apiUrl).query(baseQuery);
        expect(res.status).toBe(500);
      });

      it("passes error to next() when getSubscription throws", async () => {
        jest
          .spyOn(KeyService.prototype, "getApiKey")
          .mockResolvedValue(VALID_KEY);
        jest
          .spyOn(SubscriptionService.prototype, "getSubscription")
          .mockRejectedValue(new Error("Subscription fetch failed"));

        const res = await getApp().get(apiUrl).query(baseQuery);
        expect(res.status).toBe(500);
      });
    });
  });
}

module.exports = {
  describeResetSubscriptionMiddleware,
  VALID_KEY,
  VALID_SUBSCRIPTION,
};
