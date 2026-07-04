/**
 * Rewards Transaction Reversal Controller Tests
 *
 * Tests for admin-only transaction reversal functionality.
 */

const request = require("supertest");
const { RewardsService } = require("../../../services");
const { UserSessionService } = require("../../../services");
const {
  MOCK_SESSION_ID,
  MOCK_USERS,
  MOCK_REWARD_TRANSACTION,
} = require("../../../utils/mocks");
const app = require("../../../server");

describe("Rewards Controller - Transaction Reversal", () => {
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

  describe("reverseTransactionController", () => {
    const transactionId = MOCK_REWARD_TRANSACTION._id.toString();
    const endpoint = `/api/admin/rewards/transactions/${transactionId}/reverse`;

    it("401 - User not authenticated", async () => {
      const response = await request(app).post(endpoint).send({
        reason: "System error",
      });

      expect(response.status).toBe(401);
    });

    it("401 - User is not an admin", async () => {
      const nonAdminSession = {
        userId: MOCK_USERS[0], // Regular user, not admin
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(nonAdminSession);

      const response = await request(app)
        .post(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
        .send({
          reason: "System error",
        });

      expect(response.status).toBe(401);
    });

    it("400 - Reversal reason is required", async () => {
      const adminSession = {
        userId: MOCK_USERS[2], // Admin user
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(adminSession);

      const response = await request(app)
        .post(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
        .send({
          // missing reason
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Reversal reason is required");
    });

    it("200 - Transaction reversed successfully", async () => {
      const adminSession = {
        userId: MOCK_USERS[2], // Admin user
      };

      const mockReversedTransaction = {
        ...MOCK_REWARD_TRANSACTION,
        is_reversed: true,
        reversed_at: new Date(),
        reversal_reason: "System error",
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(adminSession);
      jest
        .spyOn(RewardsService.prototype, "reverseTransaction")
        .mockResolvedValue(mockReversedTransaction);

      const response = await request(app)
        .post(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
        .send({
          reason: "System error",
        });

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe("Transaction reversed successfully");
      expect(response.body.data.is_reversed).toBe(true);
    });

    it("500 - Service throws an error", async () => {
      const adminSession = {
        userId: MOCK_USERS[2], // Admin user
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(adminSession);
      jest
        .spyOn(RewardsService.prototype, "reverseTransaction")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
        .send({
          reason: "System error",
        });

      expect(response.status).toBe(500);
    });
  });
});
