const request = require("supertest");
const app = require("../../../../app");
const User = require("../../../../models/Users");
const { STATUS_CODES } = require("http");
const { mockUsers } = require("../../../../utils/mocks/Users");
const { mockSubscriptions } = require("../../../../utils/mocks/Subscriptions");
const { mockKeys } = require("../../../../utils/mocks/Keys");
const Subscriptions = require("../../../../models/Subscriptions");
const Keys = require("../../../../models/Keys");

const mockUserModel = new User(mockUsers[0]);
const SubscriptionService = require("../../../../services/Subscriptions");
const KeyService = require("../../../../services/Keys");
const UserService = require("../../../../services/Users");

jest.mock("../../../../services/Users", () => ({
  fetchUserFromId: jest.fn(),
}));
jest.mock("../../../../services/Subscriptions", () => ({
  fetchSubscriptionByuserid: jest.fn(),
}));
jest.mock("../../../../services/Keys", () => ({
  fetchKeysByuserid: jest.fn(),
}));

const ENDPOINT = "/api/user/data";

describe("GET - /user/data", () => {
  
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
      .get(ENDPOINT)
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
      .get(ENDPOINT)
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
      .get(ENDPOINT)
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
    const mockSubscriptionModel = new Subscriptions(mockSubscriptions[0]);
    const mockKeyModel = new Keys(mockKeys[0]); 
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(() => mockUserModel);
    jest.spyOn(SubscriptionService, "fetchSubscriptionByuserid").mockImplementation(() => mockSubscriptionModel);

    const keyArray = Array(3).fill(mockKeyModel);
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
      .get(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      success: STATUS_CODES[200],
      data: result,
    });
  });
});
