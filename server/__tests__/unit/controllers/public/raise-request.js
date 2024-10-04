const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");
const { CreateRaiseRequestService } = require("../../../../services");
const {
  mockRaiseRequestForm,
} = require("../../../../utils/mocks/raiseRequest");

jest.mock("../../../../services/RaiseRequest", () => ({
  createRaiseRequest: jest.fn(),
}));

const mockValidPayload = {
  email: "prajwalchoudhary14@gmail.com",
  companyUrl: "https://google.com/",
};

describe("raiseRequest controller", () => {
  beforeAll(() => {
    process.env.CLIENT_PROXY_URL = "https://example.com";
  });
  afterAll(() => {
    delete process.env.CLIENT_PROXY_URL;
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("500 - Not allowed by CORS", async () => {
    const response = await request(app)
      .post("/api/public/logo-request")
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("422 - Email is required", async () => {
    const mockPayload = { ...mockValidPayload };
    delete mockPayload.email;

    const response = await request(app)
      .post("/api/public/logo-request")
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Email is required",
    });
  });

  it("422 - URL is required", async () => {
    const mockPayload = { ...mockValidPayload };
    delete mockPayload.companyUrl;

    const response = await request(app)
      .post("/api/public/logo-request")
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "URL is required",
    });
  });

  it("422 - Invalid email", async () => {
    const mockPayload = { ...mockValidPayload, email: "email.com" };
    const response = await request(app)
      .post("/api/public/logo-request")
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Invalid email",
    });
  });

  it("422 - Invalid Company URL", async () => {
    const mockPayload = { ...mockValidPayload, companyUrl: "htt://adidas.mm" };
    const response = await request(app)
      .post("/api/public/logo-request")
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Invalid URL",
    });
  });

  it("500 - Unpexpected Error", async () => {
    jest
      .spyOn(CreateRaiseRequestService, "createRaiseRequest")
      .mockImplementation(() => {
        throw new Error("Unexpected error");
      });

    const response = await request(app)
      .post("/api/public/logo-request")
      .send(mockValidPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      statusCode: 500,
      error: STATUS_CODES[500],
      message: "Unexpected error",
    });
  });

  it("500 - Something went wrong, try again later", async () => {
    jest
      .spyOn(CreateRaiseRequestService, "createRaiseRequest")
      .mockImplementationOnce(() => false);

    const response = await request(app)
      .post("/api/public/logo-request")
      .send(mockValidPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      statusCode: 500,
      error: STATUS_CODES[500],
      message: "Something went wrong, try again later",
    });
  });

  it("200 - Raise Request submitted successfully", async () => {
    jest
      .spyOn(CreateRaiseRequestService, "createRaiseRequest")
      .mockImplementation(() => mockRaiseRequestForm);

    const response = await request(app)
      .post("/api/public/logo-request")
      .send(mockValidPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      message:
        "Your raise request has been submitted successfully. We will get back to you shortly.",
    });
  });
});
