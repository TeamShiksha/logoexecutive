/**
 * Rewards Search Transactions Controller Tests
 *
 * Tests for admin-only transaction search and filtering.
 */

const request = require("supertest");
const { RewardsService } = require("../../../services");
const { UserSessionService } = require("../../../services");
const {
  MOCK_SESSION_ID,
  MOCK_USERS,
  MOCK_REWARD_TRANSACTIONS_LIST,
} = require("../../../utils/mocks");

const MOCK_TRANSACTION_SEARCH_RESPONSE = {
  data: MOCK_REWARD_TRANSACTIONS_LIST,
  total: 3,
  page: 1,
  limit: 10,
  totalPages: 1,
};
const app = require("../../../server");

describe("Rewards Controller - Search Transactions", () => {
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

  describe("searchTransactionsController", () => {
    const endpoint = `/api/admin/rewards/transactions/search`;

    it("401 - User not authenticated", async () => {
      const response = await request(app).get(endpoint);

      expect(response.status).toBe(401);
    });

    it("401 - User is not an admin", async () => {
      const nonAdminSession = {
        userId: MOCK_USERS[0], // Use regular user, not admin
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(nonAdminSession);

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(401);
    });

    it("200 - Returns search results with default pagination", async () => {
      const adminSession = {
        userId: MOCK_USERS[2], // Admin user
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(adminSession);
      jest
        .spyOn(RewardsService.prototype, "searchTransactions")
        .mockResolvedValue(MOCK_TRANSACTION_SEARCH_RESPONSE);

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it("200 - Returns filtered search results", async () => {
      const adminSession = {
        userId: MOCK_USERS[2], // Admin user
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(adminSession);
      jest
        .spyOn(RewardsService.prototype, "searchTransactions")
        .mockResolvedValue(MOCK_TRANSACTION_SEARCH_RESPONSE);

      const userId = MOCK_USERS[0]._id.toString();
      const response = await request(app)
        .get(`${endpoint}?userId=${userId}&type=BONUS`)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
    });

    it("500 - Service throws an error", async () => {
      const adminSession = {
        userId: MOCK_USERS[2], // Admin user
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(adminSession);
      jest
        .spyOn(RewardsService.prototype, "searchTransactions")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(500);
    });
  });
});
