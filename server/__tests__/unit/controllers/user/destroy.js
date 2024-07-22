const request = require("supertest");
const { v4: uuidv4 } = require("uuid");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");

const { Users } = require("../../../../models");
const { KeyService } = require("../../../../services");

const mockUser = new Users({
  userId: "1",
  email: "john@email.com",
  firstName: "firstName",
  lastName: "lastName",
  updatedAt: Date.now(),
  createdAt: Date.now(),
});
jest.mock("../../../../services/Keys", () => ({
  destroyKey: jest.fn(),
}));

const ENDPOINT = "/api/user/destroy";

describe("generate-key controller", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
    process.env.CLIENT_PROXY_URL = "http://validcorsorigin.com";
  });
  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_PROXY_URL;
  });

  it("500 - Not allowed by CORS", async () => {
    const response = await request(app)
      .delete(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("422 - Key ID must be a valid UUID", async () => {
    const mockToken = mockUser.generateJWT();
    const response = await request(app)
      .delete(ENDPOINT)
      .query({ keyId: "90" })
      .set("cookie", `jwt=${mockToken}`);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Key ID must be a valid UUID",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - Key ID is required", async () => {
    const mockToken = mockUser.generateJWT();
    const response = await request(app)
      .delete(ENDPOINT)
      .query({})
      .set("cookie", `jwt=${mockToken}`);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Key ID is required",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("500 - Unexpected error", async () => {
    const mockToken = mockUser.generateJWT();
    jest.spyOn(KeyService, "destroyKey").mockImplementation(() => {
      throw new Error("Unexected error");
    });
    const response = await request(app)
      .delete(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`)
      .query({ keyId: uuidv4() });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Unexected error",
      statusCode: 500,
    });
  });

  it("404 - Key not found or could not be deleted", async () => {
    const mockToken = mockUser.generateJWT();
    jest.spyOn(KeyService, "destroyKey").mockResolvedValueOnce(false);
    const response = await request(app)
      .delete(ENDPOINT)
      .query({ keyId: uuidv4() })
      .set("cookie", `jwt=${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Key not found or could not be deleted",
      statusCode: STATUS_CODES[404],
    });
  });

  it("200 - Key deleted successfully", async () => {
    const mockToken = mockUser.generateJWT();
    jest.spyOn(KeyService, "destroyKey").mockResolvedValueOnce(true);
    const keyid = uuidv4();
    const response = await request(app)
      .delete(ENDPOINT)
      .query({ keyId: keyid })
      .set("cookie", `jwt=${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Key deleted successfully",
      statusCode: STATUS_CODES[200],
    });
  });
});
