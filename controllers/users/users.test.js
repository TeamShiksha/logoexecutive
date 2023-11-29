const request = require("supertest");
const app = require("../../app");

describe("update-password controller", () =>{
  describe("Payload", () =>{

    it("Should return 422 when confirmPassword does not match newPassword", async() =>{
      const response = await request(app)
        .post("/users/update-password")
        .send({ 
          "payload": {
            "currPassword": "Aviralyadav@7",
            "newPassword": "Aviralyadav@8",
            "confirmPassword": "doesNotMatch"
          }, 
          "userData": {
            "id": "WSHa3htFEv3WUblbTv1t",
            "firstName": "James",
            "lastName": "Bond",
            "email": "someone420@email.com",
            "timeStamps": {
              "created": "2023-11-28T11:50:58.501Z",
              "modified": "2023-11-28T11:50:58.501Z"
            }
          }
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        message: "confirmPassword does not match newPassword",
        statusCode: 422,
        error: "Unprocessable payload",
      });
    });

    it("Should return 422 when newPassword has invalid format", async() =>{
      const response = await request(app)
        .post("/users/update-password")
        .send({ 
          "payload": {
            "currPassword": "Aviralyadav@7",
            "newPassword": "onlyletters",
            "confirmPassword": "onlyletters"
          }, 
          "userData": {
            "id": "WSHa3htFEv3WUblbTv1t",
            "firstName": "James",
            "lastName": "Bond",
            "email": "someone420@email.com",
            "timeStamps": {
              "created": "2023-11-28T11:50:58.501Z",
              "modified": "2023-11-28T11:50:58.501Z"
            }
          }
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        message: "New password does not include atleast one lowercase, uppercase, digit, special character",
        statusCode: 422,
        error: "Unprocessable payload",
      });
    });
  });
});