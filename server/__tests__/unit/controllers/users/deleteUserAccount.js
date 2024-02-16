const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");
const User = require("../../../../models/Users");
const { mockUsers } = require("../../../../utils/mocks/Users");
const { deleteUserAccountController } = require("../../../../controllers/deleteUserAccount");

jest.mock("../../../../services/User", () => ({
  deleteUserAccount: jest.fn(),
}));

const mockUserModel = new User(mockUsers[1]);

const ENDPOINT = "/api/users/delete";

describe("POST /users/delete", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
    process.env.BASE_URL = "http://validcorsorigin.com";
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.BASE_URL;
  });

  it("500 - CORS", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500
    });
  });

  it("200 - user data is deleted successfully", async () => {
    require("../../../../services/User").deleteUserAccount.mockResolvedValue();

    const mockToken = mockUserModel.generateJWT();

    const response = await request(app)
      .delete(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 200,
      message: STATUS_CODES[200],
      data: { message: "User data deleted successfully" },
    });
  });

  it("should call next with an error when deleteUserAccount throws an error", async () => {
  
    const mockError = new Error("Mock error");
    require("../../../../services/User").deleteUserAccount.mockRejectedValue(mockError);
  
    const mockReq = {
      userData: {
        userId: "testUserId"
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
  
    await deleteUserAccountController(mockReq, mockRes, next);
  
    expect(next).toHaveBeenCalledWith(mockError);
  });

});
