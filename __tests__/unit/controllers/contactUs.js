const request = require("supertest");
const app = require("../../../app");
const { STATUS_CODES } = require("http");

const mockValidPayload = {
  name: "first last",
  email: "example@gmail.com",
  message: "hasta la vista",
};

jest.mock("../../../services/ContactUs", () =>({
  formExists: jest.fn(),
  createForm: jest.fn(),
}));

const ContactUsService = require("../../../services/ContactUs");
const {mockFormModel} = require("../../../utils/mocks/contactUs");

describe("contactUs controller", () =>{
  beforeAll(() =>{
    process.env.BASE_URL = "https://example.com";
  });
  afterAll(() =>{
    delete process.env.BASE_URL;
  });
  afterEach(()=>{
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("422 - when email is missing", async () => {

    const mockPayload = {...mockValidPayload};
    delete mockPayload.email;

    const response = await request(app)
      .post("/contact")
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "\"email\" is required",
    });
  });

  it("422 - when name is missing", async () => {
    const mockPayload = { ...mockValidPayload };
    delete mockPayload.name;

    const response = await request(app)
      .post("/contact")
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "\"name\" is required",
    });
  });

  it("422 - when message is missing", async () => {
    const mockPayload = { ...mockValidPayload };
    delete mockPayload.message;

    const response = await request(app).post("/contact").send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "\"message\" is required",
    });
  });

  it("422 - when name contains special characters", async () => {
    const mockPayload = { ...mockValidPayload, name: "Whatthef**k" };

    const response = await request(app).post("/contact").send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Name is not valid",
    });
  });

  it("422 - when email is invalid", async () => {
    const mockPayload = { ...mockValidPayload, email: "email.com" };

    const response = await request(app).post("/contact").send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Email is not valid",
    });
  });

  it("422 - when message is invalid", async () => {
    const mockPayload = {
      ...mockValidPayload,
      message:
        "bHjmasdasdasqPpKVkCBqmAjWfqSTqERxIICTyxEaOKQuvVacQowljPRkLdfMocsQnDjWQiFWdCEGcOZMyXwkiSUIanKEmgUZxEiYFkHiUbVCuuLlSBKbjXtShOvchvJeCWzyMrlSJgZjQdWnLMphwCVyAiPQiCMBpBNuJlodYMePImsUQbhGmOzPwxNGUHDqBiQjuGXjdLJpHQttkfxXubnHguCRxLahmmLiQUjJrBTewCetIFTHyBpfIIssYhZEqyvXbeZGHzaHMTFlXbCuZzNAahPidDckJMugDVijqcwcHLUiXOESDDBposimKjPTNNGMzLIedSceXoYmqKNEfbPhByqFNZgttUlZgSHXaxmmVWHSFJTgtUImRICDKQIJfpHpvfkBATUeQvEhnhihABMYAVstzrMfAArWaBWhlErAIxDogbcyRnndpOHfRtEPvFiWaxUDrYujVuokzflNISXKOJCYGvNeRqlcjqSIiQgPIStXeUHXMBiusjL",
    };

    const response = await request(app).post("/contact").send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      error: STATUS_CODES[422],
      message: "Message is invalid (too long)",
    });
  });

  it("400 - when form already exists", async () => {
    jest.spyOn(ContactUsService, "formExists").mockImplementation(() => true);

    const response = await request(app).post("/contact").send(mockValidPayload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      error: STATUS_CODES[400],
      message: "Form is previously submitted. We will contact you soon!",
    });
  });

  it("500 - when failed to create form", async () => {
    jest.spyOn(ContactUsService, "formExists").mockImplementation(() => false);
    jest.spyOn(ContactUsService, "createForm").mockImplementation(() => null);

    const response = await request(app).post("/contact").send(mockValidPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      statusCode: 500,
      error: STATUS_CODES[500],
      message: "Unexpected error while creating form",
    });
  });

  it("200 - Form submitted succesfully", async () => {
    jest.spyOn(ContactUsService, "formExists").mockImplementation(() => false);
    jest.spyOn(ContactUsService, "createForm").mockImplementation(() => mockFormModel);

    const response = await request(app).post("/contact").send(mockValidPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      message: "Form is submitted",
    });
  });
});