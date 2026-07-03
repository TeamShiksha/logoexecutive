const request = require("supertest");
const { STATUS_CODES } = require("node:http");
const { UserSessionService } = require("../../../services");
const SubscriptionService = require("../../../services/subscriptions");
const {
  MOCK_SESSION_ID,
  MOCK_USER_SESSIONS,
  MOCK_SUBSCRIPTION_LOGS,
} = require("../../../utils/mocks");
const app = require("../../../server");

const ADMIN_SESSION = MOCK_USER_SESSIONS[2]; // ADMIN user session

describe("GET /api/admin/users/subscription/logs", () => {
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

  it("200 - returns paginated logs with defaults", async () => {
    jest
      .spyOn(SubscriptionService.prototype, "getSubscriptionLogs")
      .mockResolvedValue({
        logs: MOCK_SUBSCRIPTION_LOGS,
        total: MOCK_SUBSCRIPTION_LOGS.length,
        totalPages: 1,
      });

    const response = await request(app)
      .get("/api/admin/users/subscription/logs")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(MOCK_SUBSCRIPTION_LOGS.length);
    expect(response.body.total).toBe(MOCK_SUBSCRIPTION_LOGS.length);
    expect(response.body.totalPages).toBe(1);
    expect(response.body.currentPage).toBe(1);
  });

  it("200 - respects page and limit query params", async () => {
    const logSpy = jest
      .spyOn(SubscriptionService.prototype, "getSubscriptionLogs")
      .mockResolvedValue({
        logs: [MOCK_SUBSCRIPTION_LOGS[0]],
        total: 3,
        totalPages: 3,
      });

    const response = await request(app)
      .get("/api/admin/users/subscription/logs?page=2&limit=1")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(200);
    expect(logSpy).toHaveBeenCalledWith(2, 1);
    expect(response.body.currentPage).toBe(2);
    expect(response.body.totalPages).toBe(3);
    expect(response.body.data).toHaveLength(1);
  });

  it("422 - invalid page value (non-integer)", async () => {
    const response = await request(app)
      .get("/api/admin/users/subscription/logs?page=abc")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(422);
    expect(response.body.statusCode).toBe(422);
    expect(response.body.error).toBe(STATUS_CODES[422]);
  });

  it("422 - limit out of range (> 100)", async () => {
    const response = await request(app)
      .get("/api/admin/users/subscription/logs?limit=999")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(422);
    expect(response.body.statusCode).toBe(422);
  });

  it("401 - non-admin user rejected", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[0]); // CUSTOMER session

    const response = await request(app)
      .get("/api/admin/users/subscription/logs")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(401);
  });

  it("500 - unexpected service error", async () => {
    jest
      .spyOn(SubscriptionService.prototype, "getSubscriptionLogs")
      .mockImplementation(() => {
        throw new Error("DB crash");
      });

    const response = await request(app)
      .get("/api/admin/users/subscription/logs")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(500);
  });
});
