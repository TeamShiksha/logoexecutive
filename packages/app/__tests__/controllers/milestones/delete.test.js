/**
 * MilestoneConfig Controller – Delete tests
 * DELETE /api/admin/milestones/:id
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

describe("MilestoneConfig Controller – Delete", () => {
  const adminSession = { userId: MOCK_USERS[2] }; // ADMIN
  const id = MOCK_MILESTONE_CONFIG_INACTIVE._id.toString();
  const endpoint = `/api/admin/milestones/${id}`;

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

    const res = await request(app).delete(endpoint);
    expect(res.status).toBe(401);
  });

  it("401 – non-admin cannot delete", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue({ userId: MOCK_USERS[0] }); // CUSTOMER

    const res = await request(app)
      .delete(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(res.status).toBe(401);
  });

  it("200 – soft-deletes an inactive config", async () => {
    const deleted = { ...MOCK_MILESTONE_CONFIG_INACTIVE, is_deleted: true };
    jest
      .spyOn(MilestoneConfigService.prototype, "deleteConfig")
      .mockResolvedValue(deleted);

    const res = await request(app)
      .delete(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.statusCode).toBe(200);
    expect(res.body.data.is_deleted).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
    expect(MilestoneConfigService.prototype.deleteConfig).toHaveBeenCalledWith(
      id
    );
  });

  it("404 – config not found", async () => {
    jest
      .spyOn(MilestoneConfigService.prototype, "deleteConfig")
      .mockRejectedValue(new Error("MilestoneConfig not found"));

    const res = await request(app)
      .delete(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(STATUS_CODES[404]);
  });

  it("409 – cannot delete an active config", async () => {
    const activeEndpoint = `/api/admin/milestones/${MOCK_MILESTONE_CONFIG._id}`;
    jest
      .spyOn(MilestoneConfigService.prototype, "deleteConfig")
      .mockRejectedValue(
        new Error(
          "Cannot delete an active config — activate another config first"
        )
      );

    const res = await request(app)
      .delete(activeEndpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(res.status).toBe(409);
    expect(res.body.statusCode).toBe(409);
  });

  it("500 – service throws an unexpected error", async () => {
    jest
      .spyOn(MilestoneConfigService.prototype, "deleteConfig")
      .mockRejectedValue(new Error("Connection timeout"));

    const res = await request(app)
      .delete(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(res.status).toBe(500);
  });
});
