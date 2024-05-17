const { cloudFrontSignedURL } = require("../../../utils/cloudFront");
const dotenv = require("dotenv");
const requiredEnv = dotenv.config({}).parsed;

describe("cloudFrontSignedURL", () => {
  beforeEach(() => {
    process.env.DISTRIBUTION_DOMAIN = "https://example.cloudfront.net";
    process.env.CLOUD_FRONT_KEYPAIR_ID = requiredEnv.CLOUD_FRONT_KEYPAIR_ID;
    process.env.CLOUD_FRONT_PRIVATE_KEY = requiredEnv.CLOUD_FRONT_PRIVATE_KEY;
  });

  afterEach(() => {
    delete process.env.DISTRIBUTION_DOMAIN;
    delete process.env.CLOUD_FRONT_PRIVATE_KEY;
    delete process.env.CLOUD_FRONT_KEYPAIR_ID;
  });

  it("should successfully generate signed URL", () => {
    const path = "/image.jpg";
    const result = cloudFrontSignedURL(path);
    expect(result.success).toBe(true);
    expect(result.data).toMatch(
      /^https:\/\/example.cloudfront.net\/image.jpg\?.+/
    );
  });

  it("returns an error when path is empty", () => {
    const result = cloudFrontSignedURL("");
    expect(result.success).toBe(false);
    expect(result.message).toBe("image path is not defined");
  });
});
