const { validateEnv } = require("../../../../utils/scripts/envSchema");

const validEnv = {
  PORT: 3000,
  CLOUD_FRONT_KEYPAIR_ID: "ABCDEF1234567890",
  CLOUD_FRONT_PRIVATE_KEY: "randomText",
  DISTRIBUTION_DOMAIN: "https://d111111abcdef8.cloudfront.net",
  BASE_URL: "http://localhost:3000",
  EMAIL_HOST: "randomText",
  EMAIL_SERVICE: "randomText",
  EMAIL_PORT: 587,
  EMAIL_SECURE: true,
  EMAIL_USER: "ghosty@gmail.com",
  EMAIL_PASS: "randomText",
  GIT_USER_NAME:"jamesbond",
  GIT_USER_EMAIL: "example@gmail.com"
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

    it("All environment variables are valid", () =>{
      const result = validateEnv(validEnv, {serviceAccountKey: true});
      expect(result.error).toBeUndefined();
    });

    it("should return error message if port doesn't exists", () => {
      const env = {};
      const result = validateEnv(env, { serviceAccountKey: true });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(/\"PORT\" is required/gi);
    });

    it("should return error if port is not a valid number", () => {
      const env = { PORT: "abc" };
      const result = validateEnv(env, { serviceAccountKey: true });
      expect(result.error).toBeTruthy();
      expect(result.error.message).toBe("PORT should be a number");
    });

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
      expect(result.error.message).toMatch("EMAIL_PORT should be a number");
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
        "CLOUD_FRONT_KEYPAIR_ID can only contain uppercase letters and digits"
      );
    });

    it("should return error message if CLOUD_FRONT_PRIVATE_KEY doesn't exist", () => {
      const env = { ...validEnv };
      delete env.CLOUD_FRONT_PRIVATE_KEY;

      const result = validateEnv(env, { serviceAccountKey: true });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(
        /\"CLOUD_FRONT_PRIVATE_KEY\" is required/gi
      );
    });

    it("should return error message if DISTRIBUTION_DOMAIN is invalid", () => {
      const env = { ...validEnv };
      delete env.DISTRIBUTION_DOMAIN;
      env.DISTRIBUTION_DOMAIN = "randomText";

      const result = validateEnv(env, { serviceAccountKey: true });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(
        "DISTRIBUTION_DOMAIN must be a valid hostname"
      );
    });

    it("should return error message if DISTRIBUTION_DOMAIN does not exist", () => {
      const env = { ...validEnv };
      delete env.DISTRIBUTION_DOMAIN;
      const result = validateEnv(env, { serviceAccountKey: true });

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(
        "\"DISTRIBUTION_DOMAIN\" is required"
      );
    });

    it("Missing GIT_USER_NAME", ()=>{
      const env = {...validEnv};
      delete env.GIT_USER_NAME;
      const result = validateEnv(env, {serviceAccountKey: true });

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(
        "\"GIT_USER_NAME\" is required"
      );
    });

    it("Missing GIT_USER_NAME", ()=>{
      const env = {...validEnv};
      env.GIT_USER_NAME = 12345;
      const result = validateEnv(env, {serviceAccountKey: true });

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(
        "\"GIT_USER_NAME\" must be a string"
      );
    });

    it("Missing GIT_USER_EMAIL", ()=>{
      const env = {...validEnv};
      delete env.GIT_USER_EMAIL;
      const result = validateEnv(env, {serviceAccountKey: true });

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(
        "\"GIT_USER_EMAIL\" is required"
      );
    });

    it("Missing GIT_USER_EMAIL", ()=>{
      const env = {...validEnv};
      env.GIT_USER_EMAIL = "example@email";
      const result = validateEnv(env, {serviceAccountKey: true });

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(
        "\"GIT_USER_EMAIL\" must be a valid email"
      );
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

    it("should return error if port does not exists", () => {
      const env = { ...extendedValidEnv };
      delete env.PORT;

      const result = validateEnv(env);

      expect(result).toHaveProperty("error");
      expect(result.error.message).toMatch(/\"PORT\" is required/gi);
    });

    it("should return value for valid schema", () => {
      const result = validateEnv(extendedValidEnv);

      expect(result).toHaveProperty("value");
      expect(result.value).toStrictEqual(extendedValidEnv);
    });
  });
});