const request = require("supertest");
const app = require("../../app");

describe("contact-us Controller", () =>{
  describe("Payload", () =>{
    it("Should return 400 when email is missing", async() =>{
      const response = await request(app)
        .post("/contact-us")
        .send({ "name" : "james bond"});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        "error" : "Invalid Payload",
        "message" : "\"email\" is required"
      });
    });

    it("Should return 400 when name is missing", async() =>{
      const response = await request(app)
        .post("/contact-us")
        .send({ "email" : "someone123@email.com"});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        "error" : "Invalid Payload",
        "message" : "\"name\" is required"
      });
    });
  });
});