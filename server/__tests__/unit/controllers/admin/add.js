const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");

const { AdminService } = require("../../../../services");
const { Users } = require("../../../../models");
const { mockUsers } = require("../../../../utils/mocks/Users");

jest.mock("../../../../services/admin", () => ({
  setUserAdmin: jest.fn(),
}));

const ENDPOINT = "/api/admin/add";

describe("setAdminController", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "secret";
  });
  afterAll(() => {
    delete process.env.JWT_SECRET;
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("500 - Not allowed by CORS", async () => {
    const mockEmail = "bill_@gmail.com";
    const mockPayload = { email: mockEmail };
    const mockJWT = new Users(mockUsers[0]).generateJWT();
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

  it("422 - Invalid email", async () => {
    const mockEmail = "bill_gmail.com";
    const mockJWT = new Users(mockUsers[2]).generateJWT();
    const mockPayload = { email: mockEmail };
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      message: "Invalid email",
      error: STATUS_CODES[422],
    });
  });

  it("422 - Email is required", async () => {
    const mockJWT = new Users(mockUsers[2]).generateJWT();
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      message: "Email is required",
      error: STATUS_CODES[422],
    });
  });

  it("422 - Email must be string", async () => {
    const mockJWT = new Users(mockUsers[2]).generateJWT();
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send({ email: 8 });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      message: "Email must be string",
      error: STATUS_CODES[422],
    });
  });

  it("422 - Email length must be 50 or fewer", async () => {
    const mockJWT = new Users(mockUsers[2]).generateJWT();
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send({ email: "somebigemailthatislongenoughttogetcrazyone@gmail.com" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      message: "Email length must be 50 or fewer",
      error: STATUS_CODES[422],
    });
  });

  it("401 - The requester is not an ADMIN", async () => {
    const mockEmail = "bill_gmail.com";
    const mockJWT = new Users(mockUsers[0]).generateJWT();
    const mockPayload = { email: mockEmail };
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      statusCode: 401,
      message: "User not authorized",
      error: STATUS_CODES[401],
    });
  });

  it("404 - Given email is not present", async () => {
    const mockEmail = "bill@gmail.com";
    const mockJWT = new Users(mockUsers[2]).generateJWT();
    const mockPayload = { email: mockEmail };
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      error: STATUS_CODES[404],
      message: "User not found",
    });
  });

  it("500 - Unexpected errors", async () => {
    const mockEmail = "bill@gmail.com";
    const mockJWT = new Users(mockUsers[2]).generateJWT();
    jest.spyOn(AdminService, "setUserAdmin").mockImplementation(() => {
      throw new Error("Unexected error");
    });
    const mockPayload = { email: mockEmail };
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Unexected error",
      statusCode: 500,
    });
  });

  it("204 - Given user is already an admin", async () => {
    const mockEmail = "bill@gmail.com";
    const mockResponse = {
      success: true,
      isNewAdmin: false,
    };
    const mockJWT = new Users(mockUsers[2]).generateJWT();
    jest
      .spyOn(AdminService, "setUserAdmin")
      .mockImplementation(() => mockResponse);
    const mockPayload = { email: mockEmail };
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(204);
  });

  it("200 - User is set to admin", async () => {
    const mockResponse = {
      success: true,
      isNewAdmin: true,
    };
    const mockEmail = "bill@gmail.com";
    const mockJWT = new Users(mockUsers[2]).generateJWT();
    jest
      .spyOn(AdminService, "setUserAdmin")
      .mockImplementation(() => mockResponse);
    const mockPayload = { email: mockEmail };
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "The user has been granted admin privileges",
      statusCode: 200,
    });
  });
});
