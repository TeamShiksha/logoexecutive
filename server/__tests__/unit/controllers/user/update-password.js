const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");
const { Users } = require("../../../../models");
const { mockUsers } = require("../../../../utils/mocks/Users");

const mockUserModel = new Users(mockUsers[0]);
const ENDPOINT = "/api/user/update-password";

describe("POST - /user/update-password", () => {

  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
    process.env.BASE_URL = "http://validcorsorigin.com";
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.BASE_URL;
  });

  it("500 - CORS", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500
    });
  });

  it("422 - confirmPassword does not match newPassword", async() =>{

    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ 
        "payload": {
          "currPassword": "Aviralyadav@7",
          "newPassword": "Aviralyadav@8",
          "confirmPassword": "doesNotMatch"
        }, 
      });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "confirmPassword does not match newPassword",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - newPassword format is invalid", async() =>{

    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ 
        "payload": {
          "currPassword": "Aviralyadav@7",
          "newPassword": "small",
          "confirmPassword": "small"
        }, 
      });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "\"newPassword\" length must be at least 8 characters long",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });
});
