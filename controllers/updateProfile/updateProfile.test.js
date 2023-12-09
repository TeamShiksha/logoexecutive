const request = require("supertest");
const app = require("../../app");
const jwt = require("jsonwebtoken");
const User = require("../../models/Users");
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

    it("should return 400 when newEmail is missing", async () => {
      const mockToken = mockUser.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty",
          lastName: "Rider",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "\"newEmail\" is required",
      });
    }, 5000);

    it("should return 400 when firstName is missing", async () => {
      const mockToken = mockUser.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          lastName: "Rider",
          newEmail: "ghosty@rider.com",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "\"firstName\" is required",
      });
    }, 5000);

    it("should return 400 when lastName is missing", async () => {
      const mockToken = mockUser.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty",
          newEmail: "ghosty@rider.com",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "\"lastName\" is required",
      });
    }, 5000);

    it("should return 400 when firstName or lastName contains special characters or numbers", async () => {
      const mockToken = mockUser.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty1",
          lastName: "Rider@",
          newEmail: "ghostidergod@gmail.com",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "firstName should not contain any special character or number",
      });
    }, 5000);

    it("should return 400 when newEmail is not in a valid format", async () => {
      const mockToken = mockUser.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty",
          lastName: "Rider",
          newEmail: "ghostidergod@gmail",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "email must be a valid email address",
      });
    }, 5000);
  });
});
