const request = require("supertest");
const app = require("../../../app");

describe("Login Controller", () => {
	describe("payload", () => {
		it("should return 422 when payload is incorrect", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({ user: "hello world" });

			expect(response.status).toBe(422);
			expect(response.body).toEqual({
				error: "\"username\" is required",
				message: "Invalid payload",
				status: 422,
			});
		});

		it("should return 422 when payload format is incorrect", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({ username: "**BAD STRING**" });

			expect(response.status).toBe(422);
			expect(response.body).toEqual({
				error:
					"\"username\" can only contain alphanumeric letters and symbols _,-",
				message: "Invalid payload",
				status: 422,
			});
		});
	});
});
