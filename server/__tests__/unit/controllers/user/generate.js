const request = require("supertest");
const app = require("../../../../app");
const { Timestamp } = require("firebase-admin/firestore");
const { STATUS_CODES } = require("http");

const { Users } = require("../../../../models");
const { KeyService, SubscriptionService } = require("../../../../services");

const mockUser = new Users({
  userId: "1",
  email: "john@email.com",
  firstName: "firstName",
  lastName: "lastName",
  updatedAt: Timestamp.now().toDate(),
  createdAt: Timestamp.now().toDate(),
});

jest.mock("../../../../services/Keys", () => ({
  fetchKeysByuserid: jest.fn(),
  createKey: jest.fn(),
}));
jest.mock("../../../../services/Subscriptions", () => ({
  fetchSubscriptionByuserid: jest.fn(),
}));

const ENDPOINT = "/api/user/generate";

describe("generate-key controller", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
    process.env.BASE_URL = "http://validcorsorigin.com";
  });
  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.BASE_URL;
  });

  it("500 - Not allowed by CORS", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("422 - Description is required", async () => {
    const mockToken = mockUser.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({});

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Description is required",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 -  Description must be a string", async () => {
    const mockToken = mockUser.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ keyDescription: 5 });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Description must be a string",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 -  Description must be 20 characters or fewer", async () => {
    const mockToken = mockUser.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ keyDescription: "BAD STRING FOR LENGTH MORE THAN 20" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Description must be 20 characters or fewer",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 -  Description must contain only alphabets and spaces", async () => {
    const mockToken = mockUser.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ keyDescription: "NUMBER 20" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Description must contain only alphabets and spaces",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("200 -  Description must contain only alphabets and spaces", async () => {
    const mockToken = mockUser.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ keyDescription: "NUMBER 20" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Description must contain only alphabets and spaces",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("409 - Please provide a different key description", async () => {
    const mockToken = mockUser.generateJWT();
    jest
      .spyOn(SubscriptionService, "fetchSubscriptionByuserid")
      .mockResolvedValueOnce({ keyLimit: 2 });
    jest
      .spyOn(KeyService, "fetchKeysByuserid")
      .mockResolvedValueOnce([{ keyDescription: "Existing Description" }]);
    let response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ keyDescription: "Existing Description" });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: "Please provide a different key description",
      statusCode: 409,
      error: STATUS_CODES[409],
    });
  });

  it("403 - Maximum limit reached", async () => {
    const mockToken = mockUser.generateJWT();
    jest
      .spyOn(SubscriptionService, "fetchSubscriptionByuserid")
      .mockResolvedValueOnce({ keyLimit: 2 });
    jest
      .spyOn(KeyService, "fetchKeysByuserid")
      .mockResolvedValueOnce([
        { keyDescription: "Existing Description" },
        { keyDescription: "Someother Description" },
      ]);
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ keyDescription: "Another Description" });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "Limit reached. Consider upgrading your plan",
      statusCode: 403,
      error: STATUS_CODES[403],
    });
  });

  it("500 - Unexpected error", async () => {
    const mockToken = mockUser.generateJWT();
    jest
      .spyOn(SubscriptionService, "fetchSubscriptionByuserid")
      .mockImplementation(() => {
        throw new Error("Unexected error");
      });
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ keyDescription: "Another Description" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Unexected error",
      statusCode: 500,
    });
  });

  it("200 - Key generated successfully", async () => {
    const mockToken = mockUser.generateJWT();
    jest
      .spyOn(SubscriptionService, "fetchSubscriptionByuserid")
      .mockResolvedValueOnce({ keyLimit: 2 });
    jest.spyOn(KeyService, "fetchKeysByuserid").mockResolvedValueOnce([]);
    jest.spyOn(KeyService, "createKey").mockResolvedValueOnce({
      data: {
        keyId: "1",
        keyDescription: "Another Description",
        key: "SOMEKEYAPIKEY",
      },
    });
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ keyDescription: "Another Description" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Key generated successfully",
      statusCode: 200,
      data: {
        keyId: "1",
        keyDescription: "Another Description",
        key: "SOMEKEYAPIKEY",
      },
    });
  });

  it("200 - Key generated successfully [Already 1 key Exists]", async () => {
    const mockToken = mockUser.generateJWT();
    jest
      .spyOn(SubscriptionService, "fetchSubscriptionByuserid")
      .mockResolvedValueOnce({ keyLimit: 2 });
    jest.spyOn(KeyService, "fetchKeysByuserid").mockResolvedValueOnce([
      {
        keyId: "1",
        keyDescription: "Old Description",
        key: "SOMEKEYAPIKEY",
      },
    ]);
    jest.spyOn(KeyService, "createKey").mockResolvedValueOnce({
      data: {
        keyId: "2",
        keyDescription: "Another Description",
        key: "SOMEKEYAPIKEY",
      },
    });
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ keyDescription: "Another Description" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Key generated successfully",
      statusCode: 200,
      data: {
        keyId: "2",
        keyDescription: "Another Description",
        key: "SOMEKEYAPIKEY",
      },
    });
  });
});
