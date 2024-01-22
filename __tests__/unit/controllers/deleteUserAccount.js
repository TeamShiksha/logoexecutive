const request = require("supertest");
const app = require("../../../app");
const { STATUS_CODES } = require("http");
const User = require("../../../models/Users");
const { mockUsers } = require("../../../utils/mocks/Users");

jest.mock("../../../services/User", () => ({
  deleteUserAccount: jest.fn(),
}));

const mockUserModel = new User(mockUsers[1]);

describe("deleteUserAccountController", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  it("should return 200 when user data is deleted successfully", async () => {
    require("../../../services/User").deleteUserAccount.mockResolvedValue();

    const mockToken = mockUserModel.generateJWT();

    const response = await request(app)
      .delete("/user/delete")
      .set("cookie", `jwt=${mockToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 200,
      message: STATUS_CODES[200],
      data: { message: "User data deleted successfully" },
    });
  });
});