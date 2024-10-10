const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");
const { Users } = require("../../../../models");
const { CreateRaiseRequestService } = require("../../../../services");
const {
  mockRaiseRequestForm,
} = require("../../../../utils/mocks/raiseRequest");
const { mockUsers } = require("../../../../utils/mocks/Users");

jest.mock("../../../../services/RaiseRequest", () => ({
  createRaiseRequest: jest.fn(),
}));

const mockValidPayload = {
  user_id: new mongoose.Types.ObjectId("65bd32ab96c587421c08fd47").toString(),
  companyUrl: "https://google.com/",
};

const mockUserModel = new Users(mockUsers[0]);
describe("raiseRequest controller", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
    process.env.CLIENT_PROXY_URL = "https://example.com";
  });
  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_PROXY_URL;
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("500 - Not allowed by CORS", async () => {
    const response = await request(app)
      .post("/api/user/logo-request")
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("422 - User ID is required", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockPayload = { ...mockValidPayload };
    delete mockPayload.user_id;

    const response = await request(app)
      .post("/api/user/logo-request")
      .set("cookie", `jwt=${mockToken}`)
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "User ID is required",
    });
  });

  it("422 - User ID must be exactly 24 characters long", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockPayload = { ...mockValidPayload };
    mockPayload.user_id = "65bd32ab96c7421c08fd47";

    const response = await request(app)
      .post("/api/user/logo-request")
      .set("cookie", `jwt=${mockToken}`)
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "User ID must be exactly 24 characters long",
    });
  });

  it("422 - User ID must be a valid hexadecimal string", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockPayload = { ...mockValidPayload };
    mockPayload.user_id = "65bd32ab9^%587421c0(fd47";

    const response = await request(app)
      .post("/api/user/logo-request")
      .set("cookie", `jwt=${mockToken}`)
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "User ID must be a valid hexadecimal string",
    });
  });

  it("422 - URL is required", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockPayload = { ...mockValidPayload };
    delete mockPayload.companyUrl;

    const response = await request(app)
      .post("/api/user/logo-request")
      .set("cookie", `jwt=${mockToken}`)
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "URL is required",
    });
  });

  it("422 - Invalid Company URL", async () => {
    const mockToken = mockUserModel.generateJWT();
    const mockPayload = { ...mockValidPayload, companyUrl: "htt://adidas.mm" };
    const response = await request(app)
      .post("/api/user/logo-request")
      .set("cookie", `jwt=${mockToken}`)
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Invalid URL",
    });
  });

  it("500 - Unpexpected Error", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest
      .spyOn(CreateRaiseRequestService, "createRaiseRequest")
      .mockImplementation(() => {
        throw new Error("Unexpected error");
      });

    const response = await request(app)
      .post("/api/user/logo-request")
      .set("cookie", `jwt=${mockToken}`)
      .send(mockValidPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      statusCode: 500,
      error: STATUS_CODES[500],
      message: "Unexpected error",
    });
  });

  it("500 - Something went wrong, try again later", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest
      .spyOn(CreateRaiseRequestService, "createRaiseRequest")
      .mockImplementationOnce(() => false);

    const response = await request(app)
      .post("/api/user/logo-request")
      .set("cookie", `jwt=${mockToken}`)
      .send(mockValidPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      statusCode: 500,
      error: STATUS_CODES[500],
      message: "Something went wrong, try again later",
    });
  });

  it("200 - Raise Request submitted successfully", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest
      .spyOn(CreateRaiseRequestService, "createRaiseRequest")
      .mockImplementation(() => mockRaiseRequestForm);

    const response = await request(app)
      .post("/api/user/logo-request")
      .set("cookie", `jwt=${mockToken}`)
      .send(mockValidPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      message:
        "Your raise request has been submitted successfully. We will get back to you shortly.",
    });
  });
});
