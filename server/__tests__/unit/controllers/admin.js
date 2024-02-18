const request = require("supertest");
const { STATUS_CODES } = require("http");
const { uploadToS3 } = require("../../../services/Logo");
const { createImageData } = require("../../../services/Image");
const User = require("../../../models/Users");
const { mockUsers } = require("../../../utils/mocks/Users");

jest.mock("../../../services/Logo", () => ({
  uploadToS3: jest.fn(),
}));

jest.mock("../../../services/Image", () => ({
  createImageData: jest.fn(),
}));

const multerMock = {
  single: () => (req, res, next) => {
    req.file = {
      originalname: "test.png",
      buffer: Buffer.from("test"),
    };
    next();
  },
};

jest.mock("../../../services/Logo", () => ({
  uploadToS3: jest.fn(),
  upload: multerMock,
}));

const mockUserModel = new User(mockUsers[1]);
const app = require("../../../app");

let mockUserType = "user";

jest.mock("../../../middlewares/auth", () => (req, res, next) => {
  req.userData = { userId: "someUserId", userType: mockUserType };
  next();
});

describe("adminUploadController", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  it("should return 400 if imageName is invalid", async () => {
    mockUserType = "admin";

    const mockToken = mockUserModel.generateJWT();

    const response = await request(app)
      .post("/api/admin/upload")
      .set("cookie", `jwt=${mockToken}`)
      .send({ imageName: "invalidImageName" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid image name. It should include one of the following extensions: .png, .jpg, .svg"
    });
  });

  it("should return 403 if userType is not admin", async () => {
    mockUserType = "user"; 

    const mockToken = mockUserModel.generateJWT();

    const response = await request(app)
      .post("/api/admin/upload")
      .set("cookie", `jwt=${mockToken}`)
      .send({ imageName: "validImageName.png" });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: STATUS_CODES[403]
    });
  });

  it("should return 200 and the image data if the image is uploaded successfully", async () => {
    mockUserType = "admin"; 
    uploadToS3.mockResolvedValue("key");
    createImageData.mockResolvedValue({
      imageId: "id",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const mockToken = mockUserModel.generateJWT();

    const response = await request(app)
      .post("/api/admin/upload")
      .set("cookie", `jwt=${mockToken}`)
      .send({ imageName: "validImageName.png" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Image validimagename.png uploaded successfully to S3 bucket with key key",
      imageId: "id",
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });
});
