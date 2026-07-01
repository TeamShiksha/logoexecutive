/**
 * Rewards Leaderboard Rank Controller Tests
 *
 * Tests for retrieving a user's rank in the leaderboard.
 */

const request = require("supertest");
const { RewardsService } = require("../../../services");
const { UserSessionService } = require("../../../services");
const { MOCK_SESSION_ID, MOCK_USERS } = require("../../../utils/mocks");
const app = require("../../../server");

describe("Rewards Controller - Leaderboard Rank", () => {
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

  describe("getUserLeaderboardRankController", () => {
    const endpoint = `/api/rewards/leaderboard/rank`;

    it("200 - Returns user rank when authenticated", async () => {
      const mockSession = {
        userId: MOCK_USERS[0],
      };

      const mockRankData = {
        rank: 5,
        totalPoints: 250,
        totalUsers: 42,
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(mockSession);
      jest
        .spyOn(RewardsService.prototype, "getUserLeaderboardRank")
        .mockResolvedValue(mockRankData);

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.rank).toBe(5);
      expect(response.body.data.totalPoints).toBe(250);
      expect(response.body.data.totalUsers).toBe(42);
      expect(
        RewardsService.prototype.getUserLeaderboardRank
      ).toHaveBeenCalled();
    });

    it("200 - Returns null rank when user has no rewards", async () => {
      const mockSession = {
        userId: MOCK_USERS[0],
      };

      const mockRankData = {
        rank: null,
        totalPoints: 0,
        totalUsers: 42,
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(mockSession);
      jest
        .spyOn(RewardsService.prototype, "getUserLeaderboardRank")
        .mockResolvedValue(mockRankData);

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.data.rank).toBeNull();
      expect(response.body.data.totalPoints).toBe(0);
    });

    it("401 - Returns unauthorized when not authenticated", async () => {
      const response = await request(app).get(endpoint);

      expect(response.status).toBe(401);
    });

    it("500 - Service throws an error", async () => {
      const mockSession = {
        userId: MOCK_USERS[0],
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(mockSession);
      jest
        .spyOn(RewardsService.prototype, "getUserLeaderboardRank")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(500);
    });
  });
});
