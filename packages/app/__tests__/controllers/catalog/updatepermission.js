const request = require("supertest");
const { STATUS_CODES } = require("node:http");
const {
  MOCK_USERS,
  MOCK_SESSION_ID,
  MOCK_USER_SESSIONS,
} = require("../../../utils/mocks");
const { Messages } = require("../../../utils/constants");
const { Users } = require("../../../models");
const { UserService, UserSessionService } = require("../../../services");

const app = require("../../../server");

describe("PUT  /permission/:userId/roles/:role ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  beforeAll(() => {
    process.env.CLIENT_PROXY_URL = "https://validcorsorigin.com";
  });
  afterAll(() => {
    delete process.env.CLIENT_PROXY_URL;
  });

  it("422 - Email is not valid", async () => {
    const mockUserModel = new Users(MOCK_USERS[2]);
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[2]);

    const response = await request(app)
      .put(
        `/api/catalog/permission/${mockUserModel._id}/roles/${mockUserModel.role}`
      )
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ email: "not-an-email" });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      message: "Invalid email",
      error: STATUS_CODES[422],
    });
  });

  it("422 - Email is required", async () => {
    const mockUserModel = new Users(MOCK_USERS[2]);

    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[2]);

    const response = await request(app)
      .put(
        `/api/catalog/permission/${mockUserModel._id}/roles/${mockUserModel.role}`
      )
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({});

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      statusCode: 422,
      message: "Email is required",
      error: STATUS_CODES[422],
    });
  });

  it("404 - User not found", async () => {
    const mockUserModel = new Users(MOCK_USERS[2]);
    const mockUpdateUser = new Users(MOCK_USERS[1]);

    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[2]);
    jest
      .spyOn(UserService.prototype, "getUser")
      .mockResolvedValue(mockUserModel);
    jest
      .spyOn(UserService.prototype, "updateUserToAdmin")
      .mockResolvedValue(false);

    const response = await request(app)
      .put(
        `/api/catalog/permission/${mockUserModel._id}/roles/${mockUserModel.role}`
      )
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ email: mockUpdateUser.email });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      message: Messages.USER_NOT_FOUND,
      error: STATUS_CODES[404],
    });
  });

  it("200 - User role updated to admin", async () => {
    const mockUserModel = new Users(MOCK_USERS[2]);
    const mockUpdateUser = new Users(MOCK_USERS[1]);
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[2]);
    jest
      .spyOn(UserService.prototype, "getUser")
      .mockResolvedValue(mockUserModel);
    jest
      .spyOn(UserService.prototype, "updateUserToAdmin")
      .mockResolvedValue(mockUpdateUser);

    const response = await request(app)
      .put(
        `/api/catalog/permission/${mockUserModel._id}/roles/${mockUserModel.role}`
      )
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ email: mockUpdateUser.email });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
    });
  });

  it("500 - Internal server error", async () => {
    const mockUserModel = new Users(MOCK_USERS[2]);
    const mockUpdateUser = new Users(MOCK_USERS[1]);
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[2]);
    jest
      .spyOn(UserService.prototype, "getUser")
      .mockResolvedValue(mockUserModel);
    jest
      .spyOn(UserService.prototype, "updateUserToAdmin")
      .mockImplementation(() => {
        throw new Error();
      });

    const response = await request(app)
      .put(
        `/api/catalog/permission/${mockUserModel._id}/roles/${mockUserModel.role}`
      )
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ email: mockUpdateUser.email });

    expect(response.status).toBe(500);
  });
});
