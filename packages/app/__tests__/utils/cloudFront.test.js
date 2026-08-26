jest.mock("@aws-sdk/cloudfront-signer", () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock("@aws-sdk/client-cloudfront", () => {
  const send = jest.fn();
  return {
    __send: send,
    CloudFrontClient: jest.fn(() => ({ send })),
    CreateInvalidationCommand: jest.fn((input) => ({ input })),
  };
});

const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const {
  CloudFrontClient,
  CreateInvalidationCommand,
  __send: send,
} = require("@aws-sdk/client-cloudfront");
const {
  cloudFrontSignedURL,
  cloudFrontInvalidate,
} = require("../../utils/cloudFront");
const { CLOUD_FRONT_REGION } = require("../../utils/constants");

describe("cloudFront utility", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DISTRIBUTION_DOMAIN = "https://cdn.openlogo.fyi";
    process.env.DISTRIBUTION_ID = "distribution-1";
    process.env.CLOUD_FRONT_PRIVATE_KEY =
      "-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----";
    process.env.CLOUD_FRONT_KEYPAIR_ID = "keypair-1";
    process.env.ACCESS_KEY = "access-key";
    process.env.SECRET_ACCESS_KEY = "secret-access-key";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("cloudFrontSignedURL", () => {
    it("signs the distribution url with a five minute expiry", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));
      getSignedUrl.mockReturnValue("https://cdn.openlogo.fyi/png/a.png?signed");

      const result = cloudFrontSignedURL("/png/a.png");

      expect(getSignedUrl).toHaveBeenCalledWith({
        url: "https://cdn.openlogo.fyi/png/a.png",
        dateLessThan: new Date("2026-04-27T12:05:00.000Z"),
        privateKey:
          "-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----",
        keyPairId: "keypair-1",
      });
      expect(result).toEqual({
        data: "https://cdn.openlogo.fyi/png/a.png?signed",
        success: true,
      });

      jest.useRealTimers();
    });

    it("fails when the image path is empty", () => {
      const result = cloudFrontSignedURL("");

      expect(getSignedUrl).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: "image path is not defined",
        success: false,
      });
    });
  });

  describe("cloudFrontInvalidate", () => {
    it("sends an invalidation for every path", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));
      send.mockResolvedValue({ Invalidation: { Status: "InProgress" } });

      const result = await cloudFrontInvalidate(["/png/a.png", "/svg/a.svg"]);

      expect(CloudFrontClient).toHaveBeenCalledWith({
        region: CLOUD_FRONT_REGION,
        credentials: {
          accessKeyId: "access-key",
          secretAccessKey: "secret-access-key",
        },
      });
      expect(CreateInvalidationCommand).toHaveBeenCalledWith({
        DistributionId: "distribution-1",
        InvalidationBatch: {
          Paths: { Quantity: 2, Items: ["/png/a.png", "/svg/a.svg"] },
          CallerReference: String(Date.now()),
        },
      });
      expect(send).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ Invalidation: { Status: "InProgress" } });

      jest.useRealTimers();
    });

    it("propagates invalidation failures", async () => {
      send.mockRejectedValue(new Error("access denied"));

      await expect(cloudFrontInvalidate(["/png/a.png"])).rejects.toThrow(
        "access denied"
      );
    });
  });
});
