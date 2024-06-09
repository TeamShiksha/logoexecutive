const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");
const { ContactUsService } = require("../../../../services");
const { mockContactUsForm } = require("../../../../utils/mocks/contactUs");

jest.mock("../../../../services/ContactUs", () => ({
  formExists: jest.fn(),
  createForm: jest.fn(),
}));

const mockValidPayload = {
  name: "first last",
  email: "example@gmail.com",
  message: "Random message for testing",
};

describe("contactUs controller", () => {
  beforeAll(() => {
    process.env.CLIENT_URL = "https://example.com";
  });
  afterAll(() => {
    delete process.env.CLIENT_URL;
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("500 - Not allowed by CORS", async () => {
    const response = await request(app)
      .post("/api/public/contact-us")
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
      .post("/api/public/contact-us")
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Email is required",
    });
  });

  it("422 - Name is required", async () => {
    const mockPayload = { ...mockValidPayload };
    delete mockPayload.name;
    const response = await request(app)
      .post("/api/public/contact-us")
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Name is required",
    });
  });

  it("422 - Message is required", async () => {
    const mockPayload = { ...mockValidPayload };
    delete mockPayload.message;
    const response = await request(app)
      .post("/api/public/contact-us")
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Message is required",
    });
  });

  it("422 - Name should only contain alphabets", async () => {
    const mockPayload = { ...mockValidPayload, name: "SPeci**k" };
    const response = await request(app)
      .post("/api/public/contact-us")
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Name should only contain alphabets",
    });
  });

  it("422 - Invalid email", async () => {
    const mockPayload = { ...mockValidPayload, email: "email.com" };
    const response = await request(app)
      .post("/api/public/contact-us")
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Invalid email",
    });
  });

  it("422 - Message should be at least be 20 characters", async () => {
    const mockPayload = {
      ...mockValidPayload,
      message: "small mes",
    };
    const response = await request(app)
      .post("/api/public/contact-us")
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Message should be at least be 20 characters",
    });
  });

  it("400 - Form already submitted, try again later", async () => {
    jest.spyOn(ContactUsService, "formExists").mockImplementation(() => true);
    const response = await request(app)
      .post("/api/public/contact-us")
      .send(mockValidPayload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      error: STATUS_CODES[400],
      message: "Form already submitted, try again later",
    });
  });

  it("500 - Unexpected error", async () => {
    jest.spyOn(ContactUsService, "formExists").mockImplementation(() => false);
    jest.spyOn(ContactUsService, "createForm").mockImplementation(() => {
      throw new Error("Unexpected error");
    });
    const response = await request(app)
      .post("/api/public/contact-us")
      .send(mockValidPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      statusCode: 500,
      error: STATUS_CODES[500],
      message: "Unexpected error",
    });
  });

  it("500 - Something went wrong, try again later", async () => {
    jest.spyOn(ContactUsService, "formExists").mockImplementation(() => false);
    jest.spyOn(ContactUsService, "createForm").mockResolvedValueOnce(false);
    const response = await request(app)
      .post("/api/public/contact-us")
      .send(mockValidPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      statusCode: 500,
      error: STATUS_CODES[500],
      message: "Something went wrong, try again later",
    });
  });

  it("200 - Form submitted, our team will get in touch shortly", async () => {
    jest.spyOn(ContactUsService, "formExists").mockImplementation(() => false);
    jest
      .spyOn(ContactUsService, "createForm")
      .mockImplementation(() => mockContactUsForm);
    const response = await request(app)
      .post("/api/public/contact-us")
      .send(mockValidPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      message: "Form submitted, our team will get in touch shortly",
    });
  });
});
