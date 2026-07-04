/**
 * Rewards Transaction Stats Controller Tests
 *
 * Tests for retrieving user transaction statistics.
 */

const request = require("supertest");
const { RewardsService } = require("../../../services");
const { UserSessionService } = require("../../../services");
const {
  MOCK_USERS,
  MOCK_SESSION_ID,
  MOCK_USER_SESSIONS,
} = require("../../../utils/mocks");

const MOCK_USER_TRANSACTION_STATS = {
  userId: MOCK_USERS[0]._id,
  totalPointsEarned: 150,
  totalPointsReversed: 10,
  currentBalance: 140,
  totalTransactions: 15,
  totalMilestones: 3,
  averagePointsPerTransaction: 10,
  lastTransactionDate: new Date(),
};
const app = require("../../../server");

describe("Rewards Controller - Transaction Stats", () => {
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

  describe("getUserTransactionStatsController", () => {
    const endpoint = `/api/rewards/transactions/stats/user`;

    it("401 - User not authenticated", async () => {
      const response = await request(app).get(endpoint);

      expect(response.status).toBe(401);
    });

    it("200 - Returns user transaction statistics", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(RewardsService.prototype, "getUserTransactionStats")
        .mockResolvedValue(MOCK_USER_TRANSACTION_STATS);

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalPointsEarned).toBe(150);
      expect(response.body.data.currentBalance).toBe(140);
    });

    it("500 - Service throws an error", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(RewardsService.prototype, "getUserTransactionStats")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(500);
    });
  });
});
