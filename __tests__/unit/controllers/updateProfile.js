const request = require("supertest");
const app = require("../../../app");
const jwt = require("jsonwebtoken");
const User = require("../../../models/Users");
const { Timestamp } = require("firebase-admin/firestore");

const mockUser = new User({
  userId: "1",
  email: "johnDoe@email.com",
  firstName: "firstName",
  lastName: "lastName",
  updatedAt: Timestamp.now().toDate(),
  createdAt: Timestamp.now().toDate(),
});

describe("UpdateProfile Controller", () => {
  describe("Payload", () => {
    beforeAll(() => {
      process.env.JWT_SECRET = "my_secret";
    });

    it("should return 422 when Email is missing", async () => {
      const mockToken = mockUser.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty",
          lastName: "Rider",
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: "\"email\" is required",
        message: "Validation failed",
        status: 422,
      });
    }, 5000);

    it("should return 422 when firstName is missing", async () => {
      const mockToken = mockUser.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          lastName: "Rider",
          newEmail: "ghosty@rider.com",
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: "\"firstName\" is required",
        message: "Validation failed",
        status: 422,
      });
    }, 5000);

    it("should return 422 when lastName is missing", async () => {
      const mockToken = mockUser.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty",
          newEmail: "ghosty@rider.com",
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: "\"lastName\" is required",
        message: "Validation failed",
        status: 422,
      });
    }, 5000);

    it("should return 422 when firstName or lastName contains special characters or numbers", async () => {
      const mockToken = mockUser.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty1",
          lastName: "Rider@",
          newEmail: "ghostidergod@gmail.com",
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: "firstName should not contain any special character or number",
        message: "Validation failed",
        status: 422,
      });
    }, 5000);

    it("should return 422 when Email is not in a valid format", async () => {
      const mockToken = mockUser.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty",
          lastName: "Rider",
          newEmail: "ghostidergod@gmail",
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: "\"email\" is required",
        message: "Validation failed",
        status: 422,
      });
    }, 5000);
  });
});