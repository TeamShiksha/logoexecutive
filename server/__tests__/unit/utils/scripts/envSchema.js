const { validateEnv } = require("../../../../utils/scripts/envSchema");

const validEnv = {
  CLOUD_FRONT_KEYPAIR_ID: "ABCDEF1234567890",
  PORT:5000,
  CLOUD_FRONT_PRIVATE_KEY: "randomText",
  DISTRIBUTION_DOMAIN: "https://d111111abcdef8.cloudfront.net",
  BASE_URL: "http://localhost:3000",
  EMAIL_HOST: "randomText",
  EMAIL_SERVICE: "randomText",
  EMAIL_PORT: 587,
  EMAIL_USER: "ghosty@gmail.com",
  EMAIL_PASS: "randomText",
  BUCKET_NAME: "logoexecutive",
  BUCKET_REGION: "ap-south-1",
  ACCESS_KEY: "GH67BTYLTNVVQEC6",
  SECRET_ACCESS_KEY: "Z1Ydwv8gcywVpcwJGYWy3cDEYUOlFoiI6Aw0E",
};

const extendedValidEnv = {
  ...validEnv,
  FIRESTORE_PROJECT_ID: "randomText",
  FIRESTORE_PRIVATE_KEY: "randomText",
  FIRESTORE_PRIVATE_ID: "randomText",
  FIRESTORE_CLIENT_EMAIL: "randomText",
  FIRESTORE_CLIENT_ID: "randomText",
  FIRESTORE_TOKEN_URI: "randomText",
  FIRESTORE_AUTH_PROVIDER: "randomText",
  FIRESTORE_CLIENT_CERT: "randomText",
  UNIVERSE_DOMAIN: "randomText",
  FIRESTORE_AUTH_URI: "randomText",
};

describe("Env Schema Validation", () => {
  describe("If service account key exists", () => {
    it("should return value if port exists", () => {
      const env = { ...validEnv };
      const result = validateEnv(env, { serviceAccountKey: true });
      expect(result.error).toBeFalsy();
      expect(result).toHaveProperty("value");
      expect(result.value).toStrictEqual(env);
    });

    it("should be valid if port is a number", () => {
      const env = { ...validEnv };
      const result = validateEnv(env, { serviceAccountKey: true });

      expect(result.error).toBeFalsy();
      expect(result).toHaveProperty("value");
      expect(result.value).toStrictEqual(env);
    });

    it("should return error message if BASE_URL is not a valid URI", () => {
      const env = { ...validEnv };
      delete env.BASE_URL;
      env.BASE_URL = "randomText";
      const result = validateEnv(env, { serviceAccountKey: true });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(
        /\"BASE_URL\" must be a valid uri/gi
      );
    });

    it("should return error message if EMAIL_PORT is not a number", () => {
      const env = { ...validEnv };
      delete env.EMAIL_PORT;
      env.EMAIL_PORT = "randomText";
      const result = validateEnv(env, { serviceAccountKey: true });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(
        "\"EMAIL_PORT\" with value \"randomText\" fails to match the required pattern: /^\\d+$/"
      );
    });

    it("should return error message if EMAIL_USER is not a valid email", () => {
      const env = { ...validEnv };
      delete env.EMAIL_USER;
      env.EMAIL_USER = "randomText";
      const result = validateEnv(env, { serviceAccountKey: true });
      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(
        "\"EMAIL_USER\" must be a valid email"
      );
    });

    it("should return error message if CLOUD_FRONT_KEYPAIR_ID does not exist", () => {
      const env = { ...validEnv };
      delete env.CLOUD_FRONT_KEYPAIR_ID;

      const result = validateEnv(env, { serviceAccountKey: true });
      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(
        "\"CLOUD_FRONT_KEYPAIR_ID\" is required"
      );
    });

    it("should return error message if CLOUD_FRONT_KEYPAIR_ID is not valid", () => {
      const env = { ...validEnv };
      delete env.CLOUD_FRONT_KEYPAIR_ID;
      env.CLOUD_FRONT_KEYPAIR_ID = "R134a";

      const result = validateEnv(env, { serviceAccountKey: true });
      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(
        "\"CLOUD_FRONT_KEYPAIR_ID\" with value \"R134a\" fails to match the required pattern: /^[A-Z0-9]+$/"
      );
    });

    it("should return error message if CLOUD_FRONT_PRIVATE_KEY doesn't exist", () => {
      const env = { ...validEnv };
      delete env.CLOUD_FRONT_PRIVATE_KEY;

      const result = validateEnv(env, { serviceAccountKey: false });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(
        /\"CLOUD_FRONT_PRIVATE_KEY\" is required/gi
      );
    });

    it("should return error message if DISTRIBUTION_DOMAIN is invalid", () => {
      const env = { ...validEnv };
      delete env.DISTRIBUTION_DOMAIN;
      env.DISTRIBUTION_DOMAIN = "randomText";

      const result = validateEnv(env, { serviceAccountKey: false });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(
        "\"DISTRIBUTION_DOMAIN\" must be a valid uri with a scheme matching the https pattern"
      );
    });

    it("should return error message if DISTRIBUTION_DOMAIN does not exist", () => {
      const env = { ...validEnv };
      delete env.DISTRIBUTION_DOMAIN;
      const result = validateEnv(env, { serviceAccountKey: false });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch("\"DISTRIBUTION_DOMAIN\" is required");
    });

    it("should return error message if BUCKET NAME does not exist", () => {
      const env = { ...validEnv };
      delete env.BUCKET_NAME;
      const result = validateEnv(env, { serviceAccountKey: false });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch("\"BUCKET_NAME\" is required");
    });

    it("should return error message if BUCKET_REGION does not exist", () => {
      const env = { ...validEnv };
      delete env.BUCKET_REGION;
      const result = validateEnv(env, { serviceAccountKey: false });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch("\"BUCKET_REGION\" is required");
    });
    it("should return error message if ACCESS_KEY does not exist", () => {
      const env = { ...validEnv };
      delete env.ACCESS_KEY;
      const result = validateEnv(env, { serviceAccountKey: false });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch("\"ACCESS_KEY\" is required");
    });

    it("should return error message ifSECRET_ACCESS_KEY does not exist", () => {
      const env = { ...validEnv };
      delete env.SECRET_ACCESS_KEY;
      const result = validateEnv(env, { serviceAccountKey: false });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch("\"SECRET_ACCESS_KEY\" is required");
    });
  });
  describe("If service account key does not exists", () => {
    it("should validate with extended schema", () => {
      const env = { ...validEnv };

      const result = validateEnv(env);

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(
        /\"FIRESTORE_PROJECT_ID\" is required/gi
      );
    });

    it("should return value for valid schema", () => {
      const result = validateEnv(extendedValidEnv);

      expect(result).toHaveProperty("value");
      expect(result.value).toStrictEqual(extendedValidEnv);
    });
  });
});