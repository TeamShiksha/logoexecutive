const request = require("supertest");
const app = require("../../../../app");
const User = require("../../../../models/Users");
const { Timestamp } = require("firebase-admin/firestore");

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

  it("Should return 422 response if keyId format is invalid", async () => {
    const mockToken = mockUser.generateJWT();
    const response = await request(app)
      .delete("/api/user/destroy")
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
      .delete("/api/user/destroy")
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
