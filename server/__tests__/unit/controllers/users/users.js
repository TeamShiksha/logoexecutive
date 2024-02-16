const request = require("supertest");
const app = require("../../../../app");
const User = require("../../../../models/Users");
const { STATUS_CODES } = require("http");
const {mockUsers} = require("../../../../utils/mocks/Users");
const {mockSubscriptionModel} = require("../../../../utils/mocks/Subscriptions");
const {mockKeyModel} = require("../../../../utils/mocks/Keys");

const UserService = require("../../../../services/User");
jest.mock("../../../../services/User", ()=>({
  fetchUserFromId: jest.fn(),
  fetchUserByEmail: jest.fn(),
}));

const SubscriptionService = require("../../../../services/Subscription");
jest.mock("../../../../services/Subscription", ()=>({
  fetchSubscriptionByuserid: jest.fn(),
}));

const KeyService = require("../../../../services/Key");
jest.mock("../../../../services/Key", ()=> ({
  fetchKeysByuserid: jest.fn(),
}));

const mockUserModel = new User(mockUsers[0]);


describe("POST - /users/update-password", () => {
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
      .post("/api/users/update-password")
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
      .post("/api/users/update-password")
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

  it("422 - newPassword format is invalid", async() =>{

    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .post("/api/users/update-password")
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

describe("GET - /users/user", () => {
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
      .get("/api/users/user")
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500
    });
  });

  it("404 - User document not found", async() =>{
    const mockToken = mockUserModel.generateJWT();
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(() => null);

    const response = await request(app)
      .get("/api/users/user")
      .set("cookie", `jwt=${mockToken}`);

    expect(response.status).toBe(404); expect(response.body).toEqual({
      statusCode: 404,
      error: STATUS_CODES[404],
      message: "User document not found",
    });
  });

  it("404 - Subscription document of user not found", async() =>{
    const mockToken = mockUserModel.generateJWT();
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(() => mockUserModel);
    jest.spyOn(SubscriptionService, "fetchSubscriptionByuserid").mockImplementation(() => null);

    const response = await request(app)
      .get("/api/users/user")
      .set("cookie", `jwt=${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      error: STATUS_CODES[404],
      message: "Subscription document of user not found",
    });
  });

  it("200 - Success", async() =>{
    const mockToken = mockUserModel.generateJWT();
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(() => mockUserModel);
    jest.spyOn(SubscriptionService, "fetchSubscriptionByuserid").mockImplementation(() => mockSubscriptionModel);

    const keyArray = Array(3).fill({ ...mockKeyModel });
    jest.spyOn(KeyService, "fetchKeysByuserid").mockImplementation(() => keyArray);

    const keysToRemove = ["keyId", "userId", "updatedAt"];
    const filteredKeyData = keyArray.map((keyObject) => {
      keysToRemove.forEach((keyToRemove) => {
        delete keyObject[keyToRemove];
      });
      return keyObject;
    });

    const result = {
      "email": mockUserModel.email,
      "firstName": mockUserModel.firstName,
      "lastName": mockUserModel.lastName,

      "subscriptionId": mockSubscriptionModel.subscriptionId,
      "subscriptionType":mockSubscriptionModel.subscriptionType,
      "usageLimit": mockSubscriptionModel.usageLimit,
      "isActive": mockSubscriptionModel.isActive,
      "keys": {
        "0": { ...filteredKeyData[0]},
        "1": { ...filteredKeyData[1]},
        "2": { ...filteredKeyData[2]},
      }
    };

    const response = await request(app)
      .get("/api/users/user")
      .set("cookie", `jwt=${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      success: STATUS_CODES[200],
      data: result,
    });
  });
});
