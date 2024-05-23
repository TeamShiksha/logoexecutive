const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");
const { mockUsers } = require("../../../../utils/mocks/Users");
const { mockImages } = require("../../../../utils/mocks/Images");
const { Users } = require("../../../../models");
const { ImageService, UserService } = require("../../../../services");
const mockUserModel = new Users(mockUsers[2]);

jest.mock("../../../../services/Users", () => ({
  fetchUserFromId: jest.fn(),
}));

jest.mock("../../../../services/Images", ()=>({
  getImagesByUserId: jest.fn(),
}));

const ENDPOINT = "/api/admin/images";

describe("GET /admin/images", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
  });
  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  it("500 - Not allowed by CORS", async () => {
    const mockEmail = "bill_@gmail.com";
    const mockPayload = { email: mockEmail };
    const mockJWT = mockUserModel.generateJWT();
    const response = await request(app)
      .put(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com")
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("500 - Unexpected errors", async () => {
    const mockJWT = new Users(mockUsers[2]).generateJWT();
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(() => {
      throw new Error("Unexpected error");
    });
    const response = await request(app)
      .get(ENDPOINT)
      .set("cookie", `jwt=${mockJWT}`);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Unexpected error",
      statusCode: 500,
    });
  });

  it("404 - User data is not valid", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(()=>null);
    const response = await request(app)
      .get(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      error: STATUS_CODES[404],
      message: "User document not found",
    });
  });

  it("200 - No images found when user has not yet uploaded any images", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(()=>mockUserModel);
    jest.spyOn(ImageService, "getImagesByUserId").mockImplementation(()=>null);
    const response =  await request(app)
      .get(ENDPOINT)
      .set("cookie",`jwt=${mockToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: [],
    });
  });

  it("should return all images with id, name, createdAt, updatedAt details when images found", async () => {
    const mockToken = mockUserModel.generateJWT();
    jest.spyOn(UserService, "fetchUserFromId").mockImplementation(()=>mockUserModel);
    jest.spyOn(ImageService, "getImagesByUserId").mockImplementation(() => mockImages[0]);
    const response = await request(app)
      .get(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: {
        domainame: expect.any(String),
        imageId: expect.any(String),
        createdAt: expect.objectContaining({
          _seconds: expect.any(Number),
          _nanoseconds: expect.any(Number)
        }),
        updatedAt: expect.objectContaining({
          _seconds: expect.any(Number),
          _nanoseconds: expect.any(Number)
        })
      }
    });
  });



});
