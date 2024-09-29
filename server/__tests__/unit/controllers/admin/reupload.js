const request = require("supertest");
const { STATUS_CODES } = require("http");

const { Users, Images } = require("../../../../models/index");
const { mockUsers } = require("../../../../utils/mocks/Users");
const app = require("../../../../app");
const { ImageService } = require("../../../../services");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongo_uri = mongoServer.getUri();
  await mongoose.connect(mongo_uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

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
}));

const ENDPOINT = "/api/admin/reupload";

describe("adminReUploadController", () => {
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
});
