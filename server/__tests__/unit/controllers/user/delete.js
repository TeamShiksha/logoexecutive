const request = require("supertest");
const app = require("../../../../app");
const { STATUS_CODES } = require("http");
const { Users } = require("../../../../models");
const { mockUsers } = require("../../../../utils/mocks/Users");
const deleteUserAccountController = require("../../../../controllers/user/delete");

jest.mock("../../../../services/Users", () => ({
  deleteUserAccount: jest.fn(),
}));

const mockUserModel = new Users(mockUsers[1]);
const ENDPOINT = "/api/user/delete";

describe("deleteUserAccountController", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
    process.env.CLIENT_URL = "http://validcorsorigin.com";
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_URL;
  });

  it("500 - Not allowed by CORS", async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("should return 200 when user data is deleted successfully", async () => {
    require("../../../../services/Users").deleteUserAccount.mockResolvedValue();

    const mockToken = mockUserModel.generateJWT();

    const response = await request(app)
      .delete(ENDPOINT)
      .set("cookie", `jwt=${mockToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 200,
      message: "Your user data has been successfully deleted from our system",
    });
  });

  it("should call next with an error when deleteUserAccount throws an error", async () => {
    const mockError = new Error("Mock error");
    require("../../../../services/Users").deleteUserAccount.mockRejectedValue(
      mockError
    );

    const mockReq = {
      userData: {
        userId: "testUserId",
      },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await deleteUserAccountController(mockReq, mockRes, next);

    expect(next).toHaveBeenCalledWith(mockError);
  });
});
