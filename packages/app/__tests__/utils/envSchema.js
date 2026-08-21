const { validateEnv } = require("../../utils/envSchema");

const validEnv = {
  ACCESS_KEY: "access-key",
  ADMINSEMAILS: "admin@example.com",
  BUCKET_KEY: "logos",
  BUCKET_NAME: "bucket",
  BUCKET_REGION: "us-east-1",
  CLIENT_PROXY_URL: "https://proxy.example.com",
  CLIENT_URL: "https://app.example.com",
  CLOUD_FRONT_KEYPAIR_ID: "ABC123",
  CLOUD_FRONT_PRIVATE_KEY: "private-key",
  CRYPTO_KEY:
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  DISTRIBUTION_DOMAIN: "https://abc.cloudfront.net",
  MONGO_URL: "mongodb://localhost:27017/openlogo",
  NODE_ENV: "prod",
  PORT: "3000",
  SECRET_ACCESS_KEY: "secret-key",
  UPSTASH_REDIS_REST_TOKEN: "token",
  UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
};

describe("env schema", () => {
  it("accepts complete Upstash rate limit configuration", () => {
    const { error } = validateEnv({
      ...validEnv,
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "token",
      RATE_LIMIT_REDIS_PREFIX: "openlogo:test",
    });

    expect(error).toBeUndefined();
  });

  it("rejects partial Upstash rate limit configuration", () => {
    const { error } = validateEnv({
      ...validEnv,
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: undefined,
    });

    expect(error).toBeDefined();
  });

  it("rejects missing Upstash rate limit configuration", () => {
    const { error } = validateEnv({
      ...validEnv,
      UPSTASH_REDIS_REST_URL: undefined,
      UPSTASH_REDIS_REST_TOKEN: undefined,
    });

    expect(error).toBeDefined();
  });
});
