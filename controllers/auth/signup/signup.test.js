const request = require("supertest");
const app = require("../../../app");

const mockValidPayload = {
  firstName: "Joe",
  email: "Joe@example.com",
  password: "good joe",
  confirmPassword: "good joe",
};

describe("Signup Controller", () => {
  describe("payload", () => {
    it("should return 422 when payload is incorrect", async () => {
      const response = await request(app)
        .post("/auth/signup")
        .send({ user: "hello world" });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        message: "\"firstName\" is required",
        statusCode: 422,
        error: "unprocessable content",
      });
    });

    it("should return 422 when payload format is incorrect", async () => {
      const mockPayload = { ...mockValidPayload, firstName: "J*e" };

      const response = await request(app)
        .post("/auth/signup")
        .send(mockPayload);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        message: "firstName should not contain any special character or number",
        statusCode: 422,
        error: "unprocessable content",
      });
    });
  });
});
