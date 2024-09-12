const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");
const { Users, ContactUs } = require("../../../../models");
const { mockUsers } = require("../../../../utils/mocks/Users");
const { UserType } = require("../../../../utils/constants");
const { mockContactUsForm } = require("../../../../utils/mocks/contactUs");
const { ContactUsService, UserService } = require("../../../../services");
const SendEmailService = require("../../../../utils/sendEmail");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const mockOperator = new Users(
  mockUsers.find((item) => item.userType === UserType.OPERATOR),
);

jest.mock("../../../../services/Users", () => ({
  fetchUserFromId: jest.fn(),
}));
jest.mock("../../../../utils/sendEmail", () => ({
  sendEmail: jest.fn(),
}));

const ENDPOINT = "/api/operator/revert";

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongo_uri = mongoServer.getUri();
  await mongoose.connect(mongo_uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Revert To Customer Controller", () => {
  const SendEmailSpy = jest.spyOn(SendEmailService, "sendEmail");

  beforeAll(() => {
    process.env.JWT_SECRET = "mysecret";
    process.env.CLIENT_PROXY_URL = "http://example.com";
    process.env.CLIENT_URL = "http://example.com";
  });
  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  it("401 - The requester is not an OPERATOR", async () => {
    const mockContactUsData = mockContactUsForm[0];
    const mockJWT = new Users(mockUsers[0]).generateJWT();
    const mockPayload = {
      id: mockContactUsData._id,
      reply: "dsbb hdsjbddnn",
    };
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      message: "User not authorized",
      error: STATUS_CODES[401],
    });
  });

  it("409 - Already replied to the customer", async () => {
    const form = new ContactUs(mockContactUsForm[2]);
    await form.save();
    const mockJWT = mockOperator.generateJWT();

    const mockPayload = {
      id: form._id,
      reply: "Hi there where are you now where are you now when I need you",
    };
    jest.spyOn(ContactUsService, "updateForm").mockImplementationOnce(() => {
      return { alreadyReplied: true };
    });
    jest.spyOn(UserService, "fetchUserFromId").mockImplementationOnce(() => {
      return mockOperator;
    });
    SendEmailSpy.mockImplementationOnce(() => {
      return { success: false };
    });
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      statusCode: 409,
      message: "Already sent the response for this query!",
      error: STATUS_CODES[409],
    });
  });

  it("500 - Failed to send email to customer", async () => {
    const form = new ContactUs(mockContactUsForm[3]);
    await form.save();
    const mockJWT = mockOperator.generateJWT();
    const mockPayload = {
      id: form._id,
      reply: "Hi there where are you now where are you now when I need you",
    };
    jest.spyOn(ContactUsService, "updateForm").mockImplementationOnce(() => {
      return {
        reply: mockPayload.reply,
        activityStatus: true,
        assignedTo: form._id,
      };
    });
    jest.spyOn(UserService, "fetchUserFromId").mockImplementationOnce(() => {
      return mockOperator;
    });
    SendEmailSpy.mockImplementation(() => {
      return { success: false };
    });
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      statusCode: 500,
      message: "Failed to send email to customer",
      error: STATUS_CODES[500],
    });
  });

  it("200 - Success", async () => {
    const form = new ContactUs(mockContactUsForm[4]);
    await form.save();
    const mockJWT = mockOperator.generateJWT();
    const mockPayload = {
      id: form._id,
      reply: "Hi there where are you now where are you now when I need you",
    };
    jest.spyOn(ContactUsService, "updateForm").mockImplementationOnce(() => {
      return {
        reply: mockPayload.reply,
        activityStatus: true,
        assignedTo: form._id,
      };
    });
    SendEmailSpy.mockImplementation(() => {
      return { success: true };
    });
    jest.spyOn(UserService, "fetchUserFromId").mockImplementationOnce(() => {
      return mockOperator;
    });
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      message: "Response sent to customer successfully",
    });
  });
});
