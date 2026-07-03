const { STATUS_CODES } = require("node:http");
const crypto = require("node:crypto");
const rateLimit = require("express-rate-limit");
const { Messages } = require("../utils/constants");

const RATE_LIMIT_POLICIES = {
  logo: {
    name: "logo",
    windowMs: 60 * 1000,
    limit: 100,
  },
  base: {
    name: "base",
    windowMs: 60 * 1000,
    limit: 60,
  },
  auth: {
    name: "auth",
    windowMs: 60 * 1000,
    limit: 60,
  },
  upload: {
    name: "upload",
    windowMs: 60 * 1000,
    limit: 60,
  },
};

class UpstashRateLimitStore {
  constructor({
    prefix = process.env.RATE_LIMIT_REDIS_PREFIX || "openlogo:rate-limit",
    name,
  }) {
    this.prefix = prefix;
    this.name = name;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  async increment(key) {
    const redisKey = this.getRedisKey(key);
    const ttlSeconds = Math.ceil(this.windowMs / 1000);
    const now = Date.now();
    const [hitsResult, , ttlResult] = await this.request("/pipeline", [
      ["INCR", redisKey],
      ["EXPIRE", redisKey, ttlSeconds, "NX"],
      ["TTL", redisKey],
    ]);

    if (!hitsResult || !ttlResult) {
      throw new Error("Invalid Upstash rate limit response");
    }

    const totalHits = Number(hitsResult.result);
    let ttl = Number(ttlResult.result);

    if (
      !Number.isInteger(totalHits) ||
      totalHits < 1 ||
      !Number.isFinite(ttl)
    ) {
      throw new Error("Invalid Upstash rate limit response");
    }

    if (ttl < 0) {
      ttl = ttlSeconds;
    }

    return {
      totalHits,
      resetTime: new Date(now + ttl * 1000),
    };
  }

  decrement() {
    return undefined;
  }

  async resetKey(key) {
    await this.request("/pipeline", [["DEL", this.getRedisKey(key)]]);
  }

  getRedisKey(key) {
    return `${this.prefix}:${this.name}:${key}`;
  }

  async request(path, body) {
    const response = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Upstash rate limit request failed: ${response.status}`);
    }

    return response.json();
  }
}

const createStore = (policy) => {
  return new UpstashRateLimitStore({ name: policy.name });
};

const hashIdentifier = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

const getClientKey = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return `ip:${hashIdentifier(ip)}`;
};

const rateLimitHandler = (_req, res) =>
  res.status(429).json({
    error: STATUS_CODES[429],
    message: Messages.TOO_MANY_REQUESTS,
    statusCode: 429,
  });

const shouldSkipRateLimit = (req) =>
  req.method === "OPTIONS" ||
  (process.env.NODE_ENV === "test" &&
    process.env.RATE_LIMIT_ENABLE_IN_TEST !== "true");

const createRateLimiter = (policy) => {
  const store = createStore(policy);
  const passOnStoreError = true;
  const limiter = rateLimit({
    windowMs: policy.windowMs,
    limit: policy.limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store,
    keyGenerator: getClientKey,
    skip: shouldSkipRateLimit,
    handler: rateLimitHandler,
    passOnStoreError,
  });

  limiter._store = store;
  limiter._keyGenerator = getClientKey;
  limiter._passOnStoreError = passOnStoreError;
  return limiter;
};

const logoLimiter = createRateLimiter(RATE_LIMIT_POLICIES.logo);
const baseLimiter = createRateLimiter(RATE_LIMIT_POLICIES.base);
const authLimiter = createRateLimiter(RATE_LIMIT_POLICIES.auth);
const uploadLimiter = createRateLimiter(RATE_LIMIT_POLICIES.upload);

module.exports = {
  RATE_LIMIT_POLICIES,
  UpstashRateLimitStore,
  createRateLimiter,
  getClientKey,
  logoLimiter,
  baseLimiter,
  authLimiter,
  uploadLimiter,
};
