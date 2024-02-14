const request = require("supertest");
const app = require("../../../app");
const jwt = require("jsonwebtoken");
const User = require("../../../models/Users");
const { Timestamp } = require("firebase-admin/firestore");
const { STATUS_CODES } = require("http");

const mockUser = new User({
  userId: "1",
  email: "john@email.com",
  firstName: "firstName",
  lastName: "lastName",
  updatedAt: Timestamp.now().toDate(),
  createdAt: Timestamp.now().toDate(),
});

describe("generate-key controller", () =>{
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
      .post("/api/keys/generate")
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500
    });
  });

  it ("Should return 422 response keyDescription format is invalid", async() =>{

    const mockToken = mockUser.generateJWT();
    const response = await request(app)
      .post("/api/keys/generate")
      .set("cookie", `jwt=${mockToken}`)
      .send({
        "payload": {
          "keyDescription": "containingNumbers12345"
        },
      });
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "keyDescription must contain only alphabets",
      statusCode: 422,
      error: "Unprocessable payload",
    });
  });

  it("Should return 422 response if keyId format is invalid", async () => {
    const mockToken = mockUser.generateJWT();
    const response = await request(app)
      .delete("/api/keys/destroy")
      .query({ keyId: "90" }) 
      .set("cookie", `jwt=${mockToken}`);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "\"keyId\" must be a valid UUID",
      statusCode: 422,
      error: "Unprocessable payload",
    });
  });

  it("Should return 422 response if keyId format is invalid", async () => {
    const mockToken = mockUser.generateJWT();
    const response = await request(app)
      .delete("/api/keys/destroy")
      .query({ keyId: 90 }) 
      .set("cookie", `jwt=${mockToken}`);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "\"keyId\" must be a valid UUID",
      statusCode: 422,
      error: "Unprocessable payload",
    });
  });
});
