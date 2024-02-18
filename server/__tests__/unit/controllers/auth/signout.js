const { mockUsers } = require("../../../../utils/mocks/Users");

const request = require("supertest");
const { STATUS_CODES } = require("http");
const app = require("../../../../app");
const User = require("../../../../models/Users");

const ENDPOINT = "/api/auth/signout";

describe("/api/signout", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "secret";
    process.env.BASE_URL = "http://validcorsorigin.com";
  });
  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.BASE_URL;
  });

  it("500 - CORS", async () => {
    const response = await request(app)
      .get(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500
    });
  });

  it("401 - Auth cookie not present", async () => {
    const response = await request(app).get(ENDPOINT);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: STATUS_CODES[400],
      message: "Failed to validate user session",
      statusCode: 400,
    });
  });

  it("205 - Successful signout", async () => {
    const mockJWT = new User(mockUsers[0]).generateJWT();
    const response = await request(app).get(ENDPOINT).set("Cookie", `jwt=${mockJWT}`);

    expect(response.status).toBe(205);
    // Should contain jwt=; in the set-cookie value
    expect(response.headers["set-cookie"][0]).toMatch(/jwt=;*/);
  });
});
