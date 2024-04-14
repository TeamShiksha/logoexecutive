const request = require("supertest");
const { STATUS_CODES } = require("http");

const { Users } = require("../../../../models/index");
const { mockUsers } = require("../../../../utils/mocks/Users");
const app = require("../../../../app");
const { ImageService } = require("../../../../services");
const { error } = require("console");

jest.mock("../../../../middlewares/fileUpload", () => ({
  single: () => (req, res, next) => {
    req.file = {
      originalname: "test.png",
      buffer: Buffer.from("test"),
    };
    next();
  },
}));
jest.mock("../../../../services/Images", () => ({
  uploadToS3: jest.fn(),
  createImageData: jest.fn(),
}));
const ENDPOINT = "/api/admin/upload";

describe("adminUploadController", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
  });
  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  it("500 -  Not allowed by CORS", async () => {
    const mockUserModel = new Users({ ...mockUsers[1], userType: "ADMIN" });
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .options(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("422 - Invalid image name. Should include extensions: .png, .jpg, .svg", async () => {
    const mockUserModel = new Users({ ...mockUsers[1], userType: "ADMIN" });
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ imageName: "invalidImageName" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      message:
        "Invalid image name. Should include extensions: .png, .jpg, .svg",
      error: STATUS_CODES[422],
    });
  });

  it("500 - should return 500 if jwt token is invalid", async () => {
    const invalidToken = "invalidToken";
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${invalidToken}`)
      .send({ imageName: "validImageName.png" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "jwt malformed",
      statusCode: 500,
    });
  });

  it("422 - Image name is required", async () => {
    const mockUserModel = new Users({ ...mockUsers[1], userType: "ADMIN" });
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({});

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      message: "Image name is required",
      error: STATUS_CODES[422],
    });
  });

  it("422 - Image file is required", async () => {
    const mockUserModel = new Users({ ...mockUsers[1], userType: "ADMIN" });
    const mockToken = mockUserModel.generateJWT();
    jest.mock("../../../../middlewares/fileUpload", () => ({
      single: jest.fn().mockImplementation(() => (req, res, next) => {
        req.file = null;
        next();
      }),
    }));
    jest.resetModules();
    const app = require("../../../../app");
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ imageName: "validImageName.png" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "Image file is required",
      statusCode: 422,
    });
  });

  it("422 -  Image name is required", async () => {
    const mockUserModel = new Users({ ...mockUsers[1], userType: "ADMIN" });
    const mockToken = mockUserModel.generateJWT();
    jest.mock("../../../../middlewares/fileUpload", () => ({
      single: jest.fn().mockImplementation(() => (req, res, next) => {
        req.file = null;
        next();
      }),
    }));
    jest.resetModules();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({});

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: STATUS_CODES[422],
      message: "Image name is required",
      statusCode: 422,
    });
  });

  it("500 - Image Upload Failed, try again later", async () => {
    const mockUserModel = new Users({ ...mockUsers[1], userType: "ADMIN" });
    jest.spyOn(ImageService, "uploadToS3").mockResolvedValueOnce(false);
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ imageName: "validImageName.png" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Image Upload Failed, try again later",
      statusCode: 500,
      error: STATUS_CODES[500],
    });
  });

  it("500 - Failed to create record", async () => {
    const mockUserModel = new Users({ ...mockUsers[1], userType: "ADMIN" });
    jest.spyOn(ImageService, "uploadToS3").mockResolvedValueOnce(true);
    jest.spyOn(ImageService, "createImageData").mockResolvedValueOnce(null);
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ imageName: "validImageName.png" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Failed to create record",
      statusCode: 500,
      error: STATUS_CODES[500],
    });
  });

  it("500 - Unexpected errors", async () => {
    const mockUserModel = new Users({ ...mockUsers[1], userType: "ADMIN" });
    jest.spyOn(ImageService, "uploadToS3").mockResolvedValueOnce(true);
    jest.spyOn(ImageService, "createImageData").mockImplementation(() => {
      throw new Error("Unexected error");
    });
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ imageName: "validImageName.png" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Unexected error",
      statusCode: 500,
    });
  });

  it("200 - Upload successfully", async () => {
    const mockUserModel = new Users({ ...mockUsers[1], userType: "ADMIN" });
    jest.spyOn(ImageService, "uploadToS3").mockResolvedValueOnce(true);
    jest.spyOn(ImageService, "createImageData").mockResolvedValueOnce({
      imageId: "id",
      createdAt: "sometimestamp",
      updatedAt: "sometimestamp",
    });
    const mockToken = mockUserModel.generateJWT();
    const response = await request(app)
      .post(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .send({ imageName: "validImageName.png" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Upload successfully",
      statusCode: 200,
      data: {
        imageId: "id",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
  });
});
