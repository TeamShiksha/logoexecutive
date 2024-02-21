const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");
const { AdminService } = require("../../../../services");
const { Users } = require("../../../../models");
const { mockUsers } = require("../../../../utils/mocks/Users");

jest.mock("../../../../services/AddAdmin", () => ({
  setUserAdmin: jest.fn()
}));

const ENDPOINT = "/api/admin/add";

describe("setAdminController", () => {

  beforeAll(() => {
    process.env.JWT_SECRET = "secret";
  })

  afterAll(() => {
    delete process.env.JWT_SECRET;
  })

  it("401 - User is not Signed In", async () => {
    const mockEmail = "bill_@gmail.com";
    const mockPayload = {"email": mockEmail};
    const response = await request(app)
      .put(ENDPOINT)
      .send(mockPayload);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        "statusCode": 401,
        "message": "User not signed in",
        "error": STATUS_CODES[401]
      });

  }) 

  it("422 - Given email is not valid", async () => {
    const mockEmail = "bill_gmail.com";
    const mockJWT = new Users(mockUsers[0]).generateJWT();
    const mockPayload = {"email": mockEmail};
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      "status": 422,
      "message": "Email must be a valid email address",
      "error": STATUS_CODES[422]
    });

  });

  it("404 - Given email is not present", async () => {
    const mockEmail = "bill@gmail.com";
    const mockJWT = new Users(mockUsers[0]).generateJWT();
    const mockPayload = {"email": mockEmail};
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      "status": 404,
      "error": STATUS_CODES[404],
      "message": "User not found"
    });

  });

  it("200 - Given user is already an admin", async () => {
    const mockResponse = {statusCode: 200, message: "User bill@gmail.com is already an admin"};
    const mockEmail = "bill@gmail.com";
    const mockJWT = new Users(mockUsers[0]).generateJWT();

    jest
      .spyOn(AdminService, "setUserAdmin")
      .mockImplementation(() => mockResponse);

    const mockPayload = {"email": mockEmail};
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
  });

  it("200 - User is set to admin", async () => {
    const mockResponse = {statusCode: 200, message: "User bill@gmail.com is now an admin"};
    const mockEmail = "bill@gmail.com";
    const mockJWT = new Users(mockUsers[0]).generateJWT();

    jest
      .spyOn(AdminService, "setUserAdmin")
      .mockImplementation(() => mockResponse);

    const mockPayload = {"email": mockEmail};
    const response = await request(app)
      .put(ENDPOINT)
      .set("Cookie", `jwt=${mockJWT}`)
      .send(mockPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);

  });
});