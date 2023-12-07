const request = require("supertest");
const app = require("../../app");
const jwt = require("jsonwebtoken");
const User = require("../../models/Users");
const { Timestamp } = require("firebase-admin/firestore");

const mockUser = new User({
  userId: "1",
  email: "john@email.com",
  firstName: "firstName",
  lastName: "lastName",
  updatedAt: Timestamp.now().toDate(),
  createdAt: Timestamp.now().toDate(),
});

describe("update-password controller", () =>{
  describe("Payload", () =>{

    beforeAll(() => {
      process.env.JWT_SECRET = "my_secret";
    });

    it("Should return 422 when confirmPassword does not match newPassword", async() =>{

      const mockToken = mockUser.generateJWT();
      const response = await request(app)
        .post("/users/update-password")
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
        error: "Unprocessable payload",
      });
    });

    it("Should return 422 when newPassword format is invalid", async() =>{

      const mockToken = mockUser.generateJWT();
      const response = await request(app)
        .post("/users/update-password")
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
        error: "Unprocessable payload",
      });
    });
  });
});