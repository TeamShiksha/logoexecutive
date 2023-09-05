const request = require("supertest");
const app = require("../server");

describe("Test the login path", () => {
  test("It should give 200 response", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ user: { username: "anonymous", password: "welcome123" } });
    expect(response.status).toEqual(200);
    expect(response._body).toHaveProperty("token");
  });
});
