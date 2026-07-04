/**
 * Rewards Transactions Controller Tests
 *
 * Tests for retrieving transaction details for images, users, and individual lookups.
 */

const request = require("supertest");
const { STATUS_CODES } = require("node:http");
const { RewardsService } = require("../../../services");
const { UserSessionService } = require("../../../services");
const {
  MOCK_REWARD_TRANSACTION,
  MOCK_REWARD_TRANSACTIONS_LIST,
  MOCK_SESSION_ID,
  MOCK_USER_SESSIONS,
  MOCK_IMAGES,
} = require("../../../utils/mocks");
const app = require("../../../server");

describe("Rewards Controller - Transactions", () => {
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

  describe("getImageTransactionsController", () => {
    const imageId = MOCK_IMAGES[0]._id.toString();
    const endpoint = `/api/rewards/transactions/image/${imageId}`;

    it("200 - Returns image transactions with default pagination", async () => {
      const mockTransactions = {
        data: MOCK_REWARD_TRANSACTIONS_LIST.slice(0, 2),
        total: 3,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      jest
        .spyOn(RewardsService.prototype, "getImageTransactions")
        .mockResolvedValue(mockTransactions);

      const response = await request(app).get(endpoint);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.page).toBe(1);
      expect(
        RewardsService.prototype.getImageTransactions
      ).toHaveBeenCalledWith(imageId, 1, 20);
    });

    it("200 - Returns image transactions with custom pagination", async () => {
      const mockTransactions = {
        data: MOCK_REWARD_TRANSACTIONS_LIST.slice(0, 1),
        total: 3,
        page: 2,
        limit: 10,
        totalPages: 1,
      };

      jest
        .spyOn(RewardsService.prototype, "getImageTransactions")
        .mockResolvedValue(mockTransactions);

      const response = await request(app).get(`${endpoint}?page=2&limit=10`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(
        RewardsService.prototype.getImageTransactions
      ).toHaveBeenCalledWith(imageId, 2, 10);
    });

    it("500 - Service throws an error", async () => {
      jest
        .spyOn(RewardsService.prototype, "getImageTransactions")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app).get(endpoint);

      expect(response.status).toBe(500);
    });
  });

  describe("getUserTransactionsController", () => {
    const endpoint = `/api/rewards/transactions/user`;

    it("401 - User not authenticated", async () => {
      const response = await request(app).get(endpoint);

      expect(response.status).toBe(401);
    });

    it("200 - Returns user transactions with default pagination", async () => {
      const mockTransactions = {
        data: MOCK_REWARD_TRANSACTIONS_LIST.slice(0, 2),
        total: 3,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(RewardsService.prototype, "getUserTransactions")
        .mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.total).toBe(3);
    });

    it("200 - Returns user transactions with custom pagination", async () => {
      const mockTransactions = {
        data: [MOCK_REWARD_TRANSACTIONS_LIST[0]],
        total: 3,
        page: 2,
        limit: 10,
        totalPages: 1,
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(RewardsService.prototype, "getUserTransactions")
        .mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get(`${endpoint}?page=2&limit=10`)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
    });

    it("500 - Service throws an error", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(RewardsService.prototype, "getUserTransactions")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(500);
    });
  });

  describe("getTransactionController", () => {
    const transactionId = MOCK_REWARD_TRANSACTION._id.toString();
    const endpoint = `/api/rewards/transactions/${transactionId}`;

    it("404 - Transaction not found", async () => {
      jest
        .spyOn(RewardsService.prototype, "getTransaction")
        .mockResolvedValue(null);

      const response = await request(app).get(endpoint);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Transaction not found",
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    });

    it("200 - Returns transaction details", async () => {
      jest
        .spyOn(RewardsService.prototype, "getTransaction")
        .mockResolvedValue(MOCK_REWARD_TRANSACTION);

      const response = await request(app).get(endpoint);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.points_earned).toBe(10);
      expect(response.body.data.points_type).toBe("USAGE_REWARD");
    });

    it("500 - Service throws an error", async () => {
      jest
        .spyOn(RewardsService.prototype, "getTransaction")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app).get(endpoint);

      expect(response.status).toBe(500);
    });
  });
});
