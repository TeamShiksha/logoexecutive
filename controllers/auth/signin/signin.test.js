const request = require("supertest");
const app = require("../../../app");

describe("Signin Controller", () => {
  describe("payload", () => {
    it("should return 422 when payload is incorrect", async () => {
      const response = await request(app)
        .post("/auth/signin")
        .send({ user: "hello world" });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        message: "\"email\" is required",
        statusCode: 422,
        error: "Unprocessable Entity"
      });
    });

    it("should return 422 when payload format is incorrect", async () => {
      const response = await request(app)
        .post("/auth/signin")
        .send({ email: "**BAD STRING**" });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        message: "Email is not valid",
        statusCode: 422,
        error: "Unprocessable Entity"
      });
    });
  });
});
