const { validateEnv } = require("./envSchema");

const validEnv = {
	PORT: 3000,
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
		it("should return error message if port doesn't exists", () => {
			const env = {};
			const result = validateEnv(env, {serviceAccountKey: true});

			expect(result).toHaveProperty("error");
			expect(result.error.message).toMatch(/\"PORT\" is required/gi);
		});

		it("should return error if port is not a valid number", () => {
			const env = {PORT: "abc"};
			const result = validateEnv(env, {serviceAccountKey: true});

			expect(result.error).toBeTruthy();
			expect(result.error.message).toBe("PORT should be a number");
		});

		it("should return value if port exists", () => {
			const env = {PORT: "3000"};
			const result = validateEnv(env, {serviceAccountKey: true});

			expect(result.error).toBeFalsy();
			expect(result).toHaveProperty("value");
			expect(result.value).toStrictEqual({PORT: "3000"});
		});

		it("should be valid if port is a number", () => {
			const env = {PORT: 3000};
			const result = validateEnv(env, {serviceAccountKey: true});

			expect(result.error).toBeFalsy();
			expect(result).toHaveProperty("value");
			expect(result.value).toStrictEqual({PORT: 3000});
		});
	});

	describe("If service account key does not exists", () => {
		it("should validate with extended schema", () => {
			const env = {PORT: "3000"};

			const result = validateEnv(env);

			expect(result).toHaveProperty("error");
			expect(result.error.message).toMatch(/\"FIRESTORE_PROJECT_ID\" is required/gi);
		});

		it("should return error if port does not exists", () => {
			const env = {...validEnv};
			delete env.PORT;

			const result = validateEnv(env);

			expect(result).toHaveProperty("error");
			expect(result.error.message).toMatch(/\"PORT\" is required/gi);
		});

		it("should return value for valid schema", () => {
			const result = validateEnv(validEnv);

			expect(result).toHaveProperty("value");
			expect(result.value).toStrictEqual(validEnv);
		});
	});
});
