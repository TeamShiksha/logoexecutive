const request = require("supertest");
const { STATUS_CODES } = require("http");
const app = require("../../../../app");
const { Users } = require("../../../../models");
const { mockUsers } = require("../../../../utils/mocks/Users");
const signoutController = require("../../../../controllers/auth/signout");

const ENDPOINT = "/api/auth/signout";

describe("/api/signout", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "secret";
    process.env.CLIENT_URL = "http://validcorsorigin.com";
  });
  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_URL;
  });

  it("500 - Not allowed by CORS", async () => {
    const response = await request(app)
      .get(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("401 - Failed to validate user session", async () => {
    const response = await request(app).get(ENDPOINT);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: STATUS_CODES[400],
      message: "Failed to validate user session",
      statusCode: 400,
    });
  });

  it("205 - Successful signout", async () => {
    const mockJWT = new Users(mockUsers[0]).generateJWT();
    const response = await request(app)
      .get(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`);

    expect(response.status).toBe(205);
    expect(response.headers["set-cookie"][0]).toMatch(/jwt=;*/);
  });
});
