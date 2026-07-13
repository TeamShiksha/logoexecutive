/**
 * MilestoneConfig Controller – Activate tests
 * PATCH /api/admin/milestones/:id/activate
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

describe("MilestoneConfig Controller – Activate", () => {
  const adminSession = { userId: MOCK_USERS[2] }; // ADMIN
  const id = MOCK_MILESTONE_CONFIG_INACTIVE._id.toString();
  const endpoint = `/api/admin/milestones/${id}/activate`;

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

  it("401 – unauthenticated request", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(null);

    const res = await request(app).patch(endpoint);
    expect(res.status).toBe(401);
  });

  it("401 – non-admin cannot activate", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue({ userId: MOCK_USERS[0] }); // CUSTOMER

    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(res.status).toBe(401);
  });

  it("200 – activates the config", async () => {
    const activated = { ...MOCK_MILESTONE_CONFIG_INACTIVE, is_active: true };
    jest
      .spyOn(MilestoneConfigService.prototype, "activateConfig")
      .mockResolvedValue(activated);

    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.statusCode).toBe(200);
    expect(res.body.data.is_active).toBe(true);
    expect(res.body.message).toMatch(/activated/i);
  });

  it("404 – config not found", async () => {
    jest
      .spyOn(MilestoneConfigService.prototype, "activateConfig")
      .mockRejectedValue(new Error("MilestoneConfig not found"));

    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.statusCode).toBe(404);
    expect(res.body.error).toBe(STATUS_CODES[404]);
  });

  it("409 – config is already active", async () => {
    jest
      .spyOn(MilestoneConfigService.prototype, "activateConfig")
      .mockRejectedValue(new Error("Config is already active"));

    const activeEndpoint = `/api/admin/milestones/${MOCK_MILESTONE_CONFIG._id}/activate`;

    const res = await request(app)
      .patch(activeEndpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(res.status).toBe(409);
    expect(res.body.statusCode).toBe(409);
  });

  it("500 – service throws an unexpected error", async () => {
    jest
      .spyOn(MilestoneConfigService.prototype, "activateConfig")
      .mockRejectedValue(new Error("DB connection lost"));

    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(res.status).toBe(500);
  });
});
