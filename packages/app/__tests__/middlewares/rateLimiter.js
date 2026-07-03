const {
  RATE_LIMIT_POLICIES,
  UpstashRateLimitStore,
  createRateLimiter,
} = require("../../middlewares/rateLimiter");
const crypto = require("crypto");

describe("rate limiter middleware", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    process.env.RATE_LIMIT_ENABLE_IN_TEST = "true";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("keeps the existing logo and base limits", () => {
    expect(RATE_LIMIT_POLICIES.logo).toMatchObject({
      windowMs: 60 * 1000,
      limit: 100,
    });
    expect(RATE_LIMIT_POLICIES.base).toMatchObject({
      windowMs: 60 * 1000,
      limit: 60,
    });
    expect(RATE_LIMIT_POLICIES.auth).toMatchObject({
      windowMs: 60 * 1000,
      limit: 60,
    });
    expect(RATE_LIMIT_POLICIES.upload).toMatchObject({
      windowMs: 60 * 1000,
      limit: 60,
    });
  });

  it("does not fall back to the express-rate-limit memory store", () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const limiter = createRateLimiter(RATE_LIMIT_POLICIES.base);

    expect(limiter.resetKey).toEqual(expect.any(Function));
    expect(limiter._store.constructor.name).toBe("UpstashRateLimitStore");
  });

  it("uses Upstash store for rate limit counters", () => {
    const limiter = createRateLimiter(RATE_LIMIT_POLICIES.base);

    expect(limiter.resetKey).toEqual(expect.any(Function));
    expect(limiter._store.constructor.name).toBe("UpstashRateLimitStore");
  });

  it("returns a consistent JSON response when the limit is exceeded", async () => {
    const express = require("express");
    const request = require("supertest");
    const app = express();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue([{ result: 1 }, { result: 1 }, { result: 60 }]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue([{ result: 2 }, { result: 0 }, { result: 60 }]),
      });

    app.get(
      "/limited",
      createRateLimiter({
        name: "test",
        windowMs: 60 * 1000,
        limit: 1,
      }),
      (_req, res) => res.status(200).json({ statusCode: 200 })
    );

    await request(app).get("/limited").expect(200);
    const response = await request(app).get("/limited").expect(429);

    expect(response.body).toEqual({
      error: "Too Many Requests",
      message: "Too many requests. Please try again later.",
      statusCode: 429,
    });
    expect(response.headers["retry-after"]).toBeDefined();
  });

  it("uses client IPs for limiter keys", () => {
    const limiter = createRateLimiter(RATE_LIMIT_POLICIES.logo);
    const key = limiter._keyGenerator({
      query: { API_KEY: "public-api-key" },
      ip: "127.0.0.1",
    });

    const hash = crypto.createHash("sha256").update("127.0.0.1").digest("hex");
    expect(key).toBe(`ip:${hash}`);
  });

  it("fails open when the Upstash store is unavailable", () => {
    const limiter = createRateLimiter(RATE_LIMIT_POLICIES.base);

    expect(limiter._passOnStoreError).toBe(true);
  });

  it("increments and expires Upstash keys in one fixed-window pipeline", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue([{ result: 1 }, { result: 1 }, { result: 60 }]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([{ result: 1 }]),
      });

    const store = new UpstashRateLimitStore({ name: "base" });
    store.init({ windowMs: 60 * 1000 });

    const result = await store.increment("127.0.0.1");
    await store.resetKey("127.0.0.1");

    expect(result.totalHits).toBe(1);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "https://example.upstash.io/pipeline",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify([
          ["INCR", "openlogo:rate-limit:base:127.0.0.1"],
          ["EXPIRE", "openlogo:rate-limit:base:127.0.0.1", 60, "NX"],
          ["TTL", "openlogo:rate-limit:base:127.0.0.1"],
        ]),
      })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "https://example.upstash.io/pipeline",
      expect.objectContaining({
        body: JSON.stringify([["DEL", "openlogo:rate-limit:base:127.0.0.1"]]),
      })
    );
  });

  it("throws a clear error when Upstash returns an invalid increment response", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue([{ result: "NaN" }]),
    });

    const store = new UpstashRateLimitStore({ name: "base" });
    store.init({ windowMs: 60 * 1000 });

    await expect(store.increment("127.0.0.1")).rejects.toThrow(
      "Invalid Upstash rate limit response"
    );
  });
});
