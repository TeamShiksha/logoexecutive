const request = require("supertest");
const app = require("../../../../app");
const User = require("../../../../models/Users");
const { Timestamp } = require("firebase-admin/firestore");
const { STATUS_CODES } = require("http");
const {mockUsers} = require("../../../../utils/mocks/Users");
const {mockSubscriptionModel} = require("../../../../utils/mocks/Subscriptions");
const {mockKeyModel} = require("../../../../utils/mocks/Keys");

const mockUserModel = new User(mockUsers[0]);
const mockUser = new User({
  userId: "1",
  email: "john@email.com",
  firstName: "firstName",
  lastName: "lastName",
  updatedAt: Timestamp.now().toDate(),
  createdAt: Timestamp.now().toDate(),
});

const UserService = require("../../../../services/User");
jest.mock("../../../../services/User", () => ({
  fetchUserFromId: jest.fn(),
}));

const SubscriptionService = require("../../../../services/Subscription");
jest.mock("../../../../services/Subscription", () => ({
  fetchSubscriptionByuserid: jest.fn(),
}));

const KeyService = require("../../../../services/Key");
jest.mock("../../../../services/Key", () => ({
  fetchKeysByuserid: jest.fn(),
}));

describe("getUser controller", ()=>{
  describe("Services behaviour", ()=>{
  
    beforeAll(() => {
      process.env.JWT_SECRET = "my_secret";
    });
  
    afterAll(() =>{
      delete process.env.JWT_SECRET;
    });
    afterEach(()=>{
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });
  
    it("404 - User document not found", async() =>{
      const mockToken = mockUser.generateJWT();
      jest.spyOn(UserService, "fetchUserFromId").mockImplementation(() => null);
  
      const response = await request(app)
        .get("/api/user/data")
        .set("cookie", `jwt=${mockToken}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: "User document not found",
      });
    });
  
    it("404 - Subscription document of user not found", async() =>{
      const mockToken = mockUser.generateJWT();
      jest.spyOn(UserService, "fetchUserFromId").mockImplementation(() => mockUserModel);
      jest.spyOn(SubscriptionService, "fetchSubscriptionByuserid").mockImplementation(() => null);
  
      const response = await request(app)
        .get("/api/user/data")
        .set("cookie", `jwt=${mockToken}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: "Subscription document of user not found",
      });
    });
  
    it("200 - Happy flow", async() =>{
      const mockToken = mockUser.generateJWT();
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
        .get("/api/user/data")
        .set("cookie", `jwt=${mockToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        success: STATUS_CODES[200],
        data: result,
      });
    });
  });
});