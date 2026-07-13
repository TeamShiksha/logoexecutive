/**
 * MilestoneConfig Controller – List & Get tests
 * GET /api/admin/milestones
 * GET /api/admin/milestones/:id
 */

const request = require("supertest");
const { STATUS_CODES } = require("node:http");
const { MilestoneConfigService } = require("../../../services");
const { UserSessionService } = require("../../../services");
const {
  MOCK_SESSION_ID,
  MOCK_USERS,
  MOCK_MILESTONE_CONFIG,
  MOCK_MILESTONE_CONFIG_INACTIVE,
} = require("../../../utils/mocks");
const app = require("../../../server");

describe("MilestoneConfig Controller – List & Get", () => {
  // admin session stub
  const adminSession = { userId: MOCK_USERS[2] }; // role: ADMIN

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(adminSession);
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  describe("GET /api/admin/milestones", () => {
    const endpoint = "/api/admin/milestones";

    it("401 – no session cookie", async () => {
      // clear session mock so middleware returns 401
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(null);

      const res = await request(app).get(endpoint);
      expect(res.status).toBe(401);
    });

    it("401 – non-admin user", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue({ userId: MOCK_USERS[0] }); // CUSTOMER

      const res = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(res.status).toBe(401);
    });

    it("200 – returns list of configs", async () => {
      const configs = [MOCK_MILESTONE_CONFIG, MOCK_MILESTONE_CONFIG_INACTIVE];
      jest
        .spyOn(MilestoneConfigService.prototype, "getAllConfigs")
        .mockResolvedValue(configs);

      const res = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBe(2);
    });

    it("200 – returns empty list when no configs exist", async () => {
      jest
        .spyOn(MilestoneConfigService.prototype, "getAllConfigs")
        .mockResolvedValue([]);

      const res = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it("500 – service throws an error", async () => {
      jest
        .spyOn(MilestoneConfigService.prototype, "getAllConfigs")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/admin/milestones/:id", () => {
    const id = MOCK_MILESTONE_CONFIG._id.toString();
    const endpoint = `/api/admin/milestones/${id}`;

    it("200 – returns the config", async () => {
      jest
        .spyOn(MilestoneConfigService.prototype, "getConfigById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG);

      const res = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it("404 – config not found", async () => {
      jest
        .spyOn(MilestoneConfigService.prototype, "getConfigById")
        .mockResolvedValue(null);

      const res = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
      expect(res.body.error).toBe(STATUS_CODES[404]);
    });

    it("500 – service throws an error", async () => {
      jest
        .spyOn(MilestoneConfigService.prototype, "getConfigById")
        .mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(res.status).toBe(500);
    });
  });
});
