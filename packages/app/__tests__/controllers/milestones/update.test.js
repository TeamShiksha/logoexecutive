/**
 * MilestoneConfig Controller – Update tests
 * PATCH /api/admin/milestones/:id
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

describe("MilestoneConfig Controller – Update", () => {
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

    const res = await request(app).patch(endpoint).send({ name: "New Name" });

    expect(res.status).toBe(401);
  });

  it("401 – non-admin cannot update", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue({ userId: MOCK_USERS[0] }); // CUSTOMER

    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ name: "New Name" });

    expect(res.status).toBe(401);
  });

  it("422 – no fields provided", async () => {
    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/name or thresholds/i);
  });

  it("422 – empty thresholds array", async () => {
    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ thresholds: [] });

    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/thresholds/i);
  });

  it("422 – invalid threshold 'at' value (zero)", async () => {
    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ thresholds: [{ at: 0, points: 10 }] });

    expect(res.status).toBe(422);
  });

  it("422 – invalid threshold 'points' value (string)", async () => {
    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ thresholds: [{ at: 5, points: "ten" }] });

    expect(res.status).toBe(422);
  });

  it("200 – updates name of inactive config", async () => {
    const updated = { ...MOCK_MILESTONE_CONFIG_INACTIVE, name: "Updated Name" };
    jest
      .spyOn(MilestoneConfigService.prototype, "updateConfig")
      .mockResolvedValue(updated);

    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.statusCode).toBe(200);
    expect(res.body.data.name).toBe("Updated Name");
    expect(res.body.message).toMatch(/updated/i);
  });

  it("200 – updates thresholds of inactive config", async () => {
    const newThresholds = [{ at: 10, points: 25 }];
    const updated = {
      ...MOCK_MILESTONE_CONFIG_INACTIVE,
      thresholds: newThresholds,
    };
    jest
      .spyOn(MilestoneConfigService.prototype, "updateConfig")
      .mockResolvedValue(updated);

    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ thresholds: newThresholds });

    expect(res.status).toBe(200);
    expect(res.body.data.thresholds).toEqual(newThresholds);
  });

  it("404 – config not found", async () => {
    jest
      .spyOn(MilestoneConfigService.prototype, "updateConfig")
      .mockRejectedValue(new Error("MilestoneConfig not found"));

    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(STATUS_CODES[404]);
  });

  it("409 – cannot edit an active config", async () => {
    const activeEndpoint = `/api/admin/milestones/${MOCK_MILESTONE_CONFIG._id}`;
    jest
      .spyOn(MilestoneConfigService.prototype, "updateConfig")
      .mockRejectedValue(
        new Error(
          "Cannot edit an active config — create a new one and activate it instead"
        )
      );

    const res = await request(app)
      .patch(activeEndpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ name: "Blocked" });

    expect(res.status).toBe(409);
    expect(res.body.statusCode).toBe(409);
  });

  it("500 – service throws an unexpected error", async () => {
    jest
      .spyOn(MilestoneConfigService.prototype, "updateConfig")
      .mockRejectedValue(new Error("Unexpected failure"));

    const res = await request(app)
      .patch(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ name: "New Name" });

    expect(res.status).toBe(500);
  });
});
