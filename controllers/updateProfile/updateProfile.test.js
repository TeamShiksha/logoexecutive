const request = require("supertest");
const app = require("../../app");

describe("UpdateProfile Controller", () => {
  describe("Payload", () => {
    it("should return 400 when email is missing", async () => {
      const response = await request(app)
        .post("/updateProfile/?currEmail=oldEmail@example.com")
        .send({
          name: "Ghosty",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Bad Request: name and email are required in the payload",
      });
    }, 5000);

    it("should return 400 when name is missing", async () => {
      const response = await request(app)
        .post("/updateProfile/?currEmail=oldEmail@example.com")
        .send({
          email: "ghostidergod@gmail.com",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Bad Request: name and email are required in the payload",
      });
    }, 5000);

    it("should return 400 when name contains special characters or numbers", async () => {
      const response = await request(app)
        .post("/updateProfile/?currEmail=oldEmail@example.com")
        .send({
          name: "Ghosty123!",
          email: "ghostidergod@gmail.com",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "firstName should not contain any special character or number",
      });
    }, 5000);

    it("should return 400 when email is not in a valid format", async () => {
      const response = await request(app)
        .post("/updateProfile/?currEmail=oldEmail@example.com")
        .send({
          name: "Ghosty",
          email: "ghostidergod@gmail",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "\"lastName\" is not allowed to be empty",
      });
    }, 5000);
  });

  describe("Query Parameter", () => {
    it("should return 400 when currEmail is missing", async () => {
      const response = await request(app)
        .post("/updateProfile/")
        .send({
          name: "Ghosty",
          email: "ghostidergod@gmail.com",
        })
        .query({ currEmail: "" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Bad Request: currEmail is required",
      });
    }, 5000);
  });
});

