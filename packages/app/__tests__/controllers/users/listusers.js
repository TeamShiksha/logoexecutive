const request = require("supertest");
const { STATUS_CODES } = require("node:http");
const { UserService, UserSessionService } = require("../../../services");
const {
  MOCK_USERS,
  MOCK_SESSION_ID,
  MOCK_USER_SESSIONS,
} = require("../../../utils/mocks");
const app = require("../../../server");

const ADMIN_SESSION = MOCK_USER_SESSIONS[2]; // ADMIN user session

describe("GET /api/admin/users", () => {
  beforeAll(() => {
    process.env.CLIENT_PROXY_URL = "https://validcorsorigin.com";
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(ADMIN_SESSION);
  });
  afterAll(() => {
    delete process.env.CLIENT_PROXY_URL;
  });

  it("422 - invalid query params (page < 1)", async () => {
    const response = await request(app)
      .get("/api/admin/users?page=0")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(422);
    expect(response.body.statusCode).toBe(422);
    expect(response.body.error).toBe(STATUS_CODES[422]);
  });

  it("422 - invalid query params (limit > 100)", async () => {
    const response = await request(app)
      .get("/api/admin/users?limit=200")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(422);
    expect(response.body.statusCode).toBe(422);
  });

  it("200 - returns users with default pagination", async () => {
    const mockResult = {
      users: [
        {
          _id: MOCK_USERS[0]._id.toString(),
          name: MOCK_USERS[0].name,
          email: MOCK_USERS[0].email,
        },
      ],
      total: 1,
    };
    jest
      .spyOn(UserService.prototype, "listUsers")
      .mockResolvedValue(mockResult);

    const response = await request(app)
      .get("/api/admin/users")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.data).toEqual(mockResult.users);
    expect(response.body.total).toBe(1);
    expect(response.body.currentPage).toBe(1);
    expect(response.body.totalPages).toBe(1);
  });

  it("200 - returns users with search param", async () => {
    const mockResult = { users: [], total: 0 };
    const listSpy = jest
      .spyOn(UserService.prototype, "listUsers")
      .mockResolvedValue(mockResult);

    const response = await request(app)
      .get("/api/admin/users?search=john&page=2&limit=5")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.total).toBe(0);
    expect(response.body.currentPage).toBe(2);
    expect(response.body.totalPages).toBe(0);
    expect(listSpy).toHaveBeenCalledWith({
      search: "john",
      page: 2,
      limit: 5,
      includeDeleted: false,
      hasRewardPoints: false,
    });
  });

  it("200 - includeDeleted=true passed through", async () => {
    const mockResult = { users: [], total: 0 };
    const listSpy = jest
      .spyOn(UserService.prototype, "listUsers")
      .mockResolvedValue(mockResult);

    const response = await request(app)
      .get("/api/admin/users?includeDeleted=true")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(200);
    expect(listSpy).toHaveBeenCalledWith(
      expect.objectContaining({ includeDeleted: true })
    );
  });

  it("500 - unexpected error", async () => {
    jest.spyOn(UserService.prototype, "listUsers").mockImplementation(() => {
      throw new Error("DB crash");
    });

    const response = await request(app)
      .get("/api/admin/users")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(500);
  });

  it("401 - non-admin user rejected", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[0]); // CUSTOMER session

    const response = await request(app)
      .get("/api/admin/users")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(401);
  });
});
