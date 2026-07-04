/**
 * MilestoneConfig Controller – Create tests
 * POST /api/admin/milestones
 */

const request = require("supertest");
const { MilestoneConfigService } = require("../../../services");
const { UserSessionService } = require("../../../services");
const {
  MOCK_SESSION_ID,
  MOCK_USERS,
  MOCK_MILESTONE_CONFIG_INACTIVE,
} = require("../../../utils/mocks");
const app = require("../../../server");

describe("MilestoneConfig Controller – Create", () => {
  const adminSession = { userId: MOCK_USERS[2] }; // ADMIN
  const endpoint = "/api/admin/milestones";

  const validBody = {
    name: "Q3 2026 Campaign",
    thresholds: [
      { at: 5, points: 10 },
      { at: 10, points: 20 },
      { at: 25, points: 50 },
    ],
  };

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

  it("401 – no session cookie", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(null);

    const res = await request(app).post(endpoint).send(validBody);
    expect(res.status).toBe(401);
  });

  it("401 – non-admin user cannot create", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue({ userId: MOCK_USERS[0] }); // CUSTOMER

    const res = await request(app)
      .post(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send(validBody);

    expect(res.status).toBe(401);
  });

  it("422 – missing name", async () => {
    const res = await request(app)
      .post(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ thresholds: validBody.thresholds });

    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body.message).toMatch(/name/i);
  });

  it("422 – missing thresholds", async () => {
    const res = await request(app)
      .post(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ name: "Test" });

    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/thresholds/i);
  });

  it("422 – empty thresholds array", async () => {
    const res = await request(app)
      .post(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ name: "Test", thresholds: [] });

    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/thresholds/i);
  });

  it("422 – invalid threshold shape (non-numeric at)", async () => {
    const res = await request(app)
      .post(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ name: "Test", thresholds: [{ at: "five", points: 10 }] });

    expect(res.status).toBe(422);
  });

  it("422 – invalid threshold shape (zero points)", async () => {
    const res = await request(app)
      .post(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({ name: "Test", thresholds: [{ at: 5, points: 0 }] });

    expect(res.status).toBe(422);
  });

  it("201 – creates config successfully", async () => {
    jest
      .spyOn(MilestoneConfigService.prototype, "createConfig")
      .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);

    const res = await request(app)
      .post(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.statusCode).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.message).toMatch(/created/i);
    expect(MilestoneConfigService.prototype.createConfig).toHaveBeenCalledWith(
      { name: validBody.name, thresholds: validBody.thresholds },
      expect.any(String)
    );
  });

  it("500 – service throws an error", async () => {
    jest
      .spyOn(MilestoneConfigService.prototype, "createConfig")
      .mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post(endpoint)
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send(validBody);

    expect(res.status).toBe(500);
  });
});
