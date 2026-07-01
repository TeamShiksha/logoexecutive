/**
 * Rewards Audit Trail Controller Tests
 *
 * Tests for retrieving audit trail of reward transactions.
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { RewardsService } = require("../../../services");
const { UserSessionService } = require("../../../services");
const {
  MOCK_USERS,
  MOCK_SESSION_ID,
  MOCK_USER_SESSIONS,
  MOCK_IMAGES,
} = require("../../../utils/mocks");

const MOCK_AUDIT_TRAIL_LIST = [
  {
    _id: new mongoose.Types.ObjectId(),
    transactionId: new mongoose.Types.ObjectId(),
    action: "POINTS_AWARDED",
    actor: MOCK_USERS[3]._id,
    details: "Awarded 10 points for usage",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    _id: new mongoose.Types.ObjectId(),
    transactionId: new mongoose.Types.ObjectId(),
    action: "TRANSACTION_REVERSED",
    actor: MOCK_USERS[3]._id,
    details: "Reversed transaction due to abuse",
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    _id: new mongoose.Types.ObjectId(),
    transactionId: new mongoose.Types.ObjectId(),
    action: "BONUS_AWARDED",
    actor: MOCK_USERS[3]._id,
    details: "Awarded 50 bonus points",
    timestamp: new Date(Date.now() - 10800000),
  },
];
const app = require("../../../server");

describe("Rewards Controller - Audit Trail", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "Your_JWT_SECRET";
    process.env.CLIENT_PROXY_URL = "https://validcorsorigin.com";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_PROXY_URL;
  });

  describe("getAuditTrailController", () => {
    const imageId = MOCK_IMAGES[0]._id.toString();
    const endpoint = `/api/rewards/audit-trail/${imageId}`;

    it("401 - User not authenticated", async () => {
      const response = await request(app).get(endpoint);

      expect(response.status).toBe(401);
    });

    it("200 - Returns audit trail for image", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(RewardsService.prototype, "getAuditTrail")
        .mockResolvedValue(MOCK_AUDIT_TRAIL_LIST);

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].action).toBe("POINTS_AWARDED");
    });

    it("500 - Service throws an error", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(RewardsService.prototype, "getAuditTrail")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(500);
    });
  });
});
