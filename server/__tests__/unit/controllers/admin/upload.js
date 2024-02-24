const request = require("supertest");
const User = require("../../../../models/Users");
const { mockUsers } = require("../../../../utils/mocks/Users");

jest.mock("../../../../middlewares/fileUpload", () => ({
  single: () => (req, res, next) => {
    req.file = {
      originalname: "test.png",
      buffer: Buffer.from("test"),
    };
    next();
  },
}));

jest.mock("../../../../services/", () => ({
  uploadToS3: jest.fn(),
  createImageData: jest.fn(),
}));

const app = require("../../../../app");

describe("adminUploadController", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  it("should return 400 if imageName is invalid", async () => {
    const mockUserModel = new User({ ...mockUsers[1], userType: "ADMIN" });
    const mockToken = mockUserModel.generateJWT();

    const response = await request(app)
      .post("/api/admin/upload")
      .set("cookie", `jwt=${mockToken}`)
      .send({ imageName: "invalidImageName" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Bad Request",
      message: "Invalid image name. It should include one of the following extensions: .png, .jpg, .svg",
      status: 400,
    });
  });


  it("should return 403 if userType is not admin", async () => {
    const mockUserModel = new User({ ...mockUsers[1], userType: "USER" });
    const mockToken = mockUserModel.generateJWT();

    const response = await request(app)
      .post("/api/admin/upload")
      .set("cookie", `jwt=${mockToken}`)
      .send({ imageName: "validImageName.png" });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "Forbidden",
      status: 403,
    });
  });

  it("should return 200 and the image data if the image is uploaded successfully", async () => {
    const mockUserModel = new User({ ...mockUsers[1], userType: "ADMIN" });
    const { uploadToS3, createImageData } = require("../../../../services");
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
      message: "Image validImageName.png uploaded successfully to S3 bucket",
      status: 200,
      imageId: "id",
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  it("should return 500 if jwt token is invalid", async () => {
    const invalidToken = "invalidToken";
  
    const response = await request(app)
      .post("/api/admin/upload")
      .set("cookie", `jwt=${invalidToken}`)
      .send({ imageName: "validImageName.png" });
  
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Internal Server Error",
      message: "jwt malformed",
      statusCode: 500
    });
  });
  
  it("should return 400 if payload is empty", async () => {
    const mockUserModel = new User({ ...mockUsers[1], userType: "ADMIN" });
    const mockToken = mockUserModel.generateJWT();
  
    const response = await request(app)
      .post("/api/admin/upload")
      .set("cookie", `jwt=${mockToken}`)
      .send({});
  
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 400,
      message: "Image name is required",
      error: "Bad Request"
    });
  });

  it("should return 400 if imageName is present but file is not", async () => {
    const mockUserModel = new User({ ...mockUsers[1], userType: "ADMIN" });
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
      .post("/api/admin/upload")
      .set("cookie", `jwt=${mockToken}`)
      .send({ imageName: "validImageName.png" });
  
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Bad Request",
      message: "Image file is required",
      status: 400,
    });
  });
  
  it("should return 400 if neither imageName nor file are present", async () => {
    const mockUserModel = new User({ ...mockUsers[1], userType: "ADMIN" });
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
      .post("/api/admin/upload")
      .set("cookie", `jwt=${mockToken}`)
      .send({});
  
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Bad Request",
      message: "Image name is required",
      status: 400,
    });
  });

  it("should handle CORS correctly", async () => {
    process.env.BASE_URL = "http://localhost:3000"; 
  
    const mockUserModel = new User({ ...mockUsers[1], userType: "ADMIN" });
    const mockToken = mockUserModel.generateJWT();
  
    const response = await request(app)
      .options("/api/admin/upload") 
      .set("cookie", `jwt=${mockToken}`)
      .set("Access-Control-Request-Method", "POST") 
      .set("Origin", process.env.BASE_URL);
    expect(response.headers["access-control-allow-origin"]).toEqual(process.env.BASE_URL); 
    expect(response.headers["access-control-allow-methods"]).toContain("POST"); 
  });
});