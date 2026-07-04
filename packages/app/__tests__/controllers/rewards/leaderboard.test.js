/**
 * Rewards Leaderboard Controller Tests
 *
 * Tests for retrieving the top creators leaderboard.
 */

const request = require("supertest");
const { RewardsService } = require("../../../services");
const { MOCK_USERS } = require("../../../utils/mocks");
const app = require("../../../server");

describe("Rewards Controller - Leaderboard", () => {
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

  describe("getRewardsLeaderboardController", () => {
    const endpoint = `/api/rewards/leaderboard`;

    it("200 - Returns leaderboard with default limit", async () => {
      const mockLeaderboard = [
        {
          rank: 1,
          userId: MOCK_USERS[0]._id,
          name: MOCK_USERS[0].name,
          email: MOCK_USERS[0].email,
          uniqueProUsersCount: 50,
          totalPointsAwarded: 500,
          milestonesAchieved: 10,
        },
        {
          rank: 2,
          userId: MOCK_USERS[1]._id,
          name: MOCK_USERS[1].name,
          email: MOCK_USERS[1].email,
          uniqueProUsersCount: 40,
          totalPointsAwarded: 400,
          milestonesAchieved: 8,
        },
      ];

      jest
        .spyOn(RewardsService.prototype, "getRewardsLeaderboard")
        .mockResolvedValue(mockLeaderboard);

      const response = await request(app).get(endpoint);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].rank).toBe(1);
      expect(response.body.data[0].totalPointsAwarded).toBe(500);
      expect(
        RewardsService.prototype.getRewardsLeaderboard
      ).toHaveBeenCalledWith(10);
    });

    it("200 - Returns leaderboard with custom limit", async () => {
      const mockLeaderboard = [
        {
          rank: 1,
          name: "Creator 5",
          totalPointsAwarded: 500,
        },
      ];

      jest
        .spyOn(RewardsService.prototype, "getRewardsLeaderboard")
        .mockResolvedValue(mockLeaderboard);

      const response = await request(app).get(`${endpoint}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(
        RewardsService.prototype.getRewardsLeaderboard
      ).toHaveBeenCalledWith(10);
    });

    it("500 - Service throws an error", async () => {
      jest
        .spyOn(RewardsService.prototype, "getRewardsLeaderboard")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app).get(endpoint);

      expect(response.status).toBe(500);
    });
  });
});
