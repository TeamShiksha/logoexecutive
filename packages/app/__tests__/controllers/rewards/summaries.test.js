/**
 * Reward Summaries Controller Tests
 *
 * Tests for retrieving reward summaries for images and users.
 */

const request = require("supertest");
const { STATUS_CODES } = require("node:http");
const { RewardsService } = require("../../../services");
const { UserSessionService } = require("../../../services");
const {
  MOCK_USERS,
  MOCK_IMAGES,
  MOCK_SESSION_ID,
  MOCK_USER_SESSIONS,
} = require("../../../utils/mocks");
const app = require("../../../server");

describe("Rewards Controller - Summaries", () => {
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

  describe("getRewardSummaryForImageController", () => {
    const imageId = MOCK_IMAGES[0]._id.toString();
    const endpoint = `/api/rewards/summary/image/${imageId}`;

    it("404 - No reward data found for this image", async () => {
      jest
        .spyOn(RewardsService.prototype, "getRewardSummaryForImage")
        .mockResolvedValue(null);

      const response = await request(app).get(endpoint);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "No reward data found for this image",
        statusCode: 404,
        error: STATUS_CODES[404],
      });
    });

    it("200 - Returns reward summary for image", async () => {
      const mockSummary = {
        imageId,
        imageName: "Test Logo",
        creator: {
          id: MOCK_USERS[0]._id,
          name: MOCK_USERS[0].name,
          email: MOCK_USERS[0].email,
        },
        uniqueProUsersCount: 10,
        uniqueProUsers: [MOCK_USERS[1]._id, MOCK_USERS[2]._id],
        totalPointsAwarded: 50,
        milestonesAchieved: [
          { milestone: 5, points: 25 },
          { milestone: 10, points: 25 },
        ],
        nextMilestone: 15,
      };

      jest
        .spyOn(RewardsService.prototype, "getRewardSummaryForImage")
        .mockResolvedValue(mockSummary);

      const response = await request(app).get(endpoint);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.imageId).toBe(imageId);
      expect(response.body.data.imageName).toBe("Test Logo");
      expect(response.body.data.uniqueProUsersCount).toBe(10);
      expect(response.body.data.totalPointsAwarded).toBe(50);
    });

    it("500 - Service throws an error", async () => {
      jest
        .spyOn(RewardsService.prototype, "getRewardSummaryForImage")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app).get(endpoint);

      expect(response.status).toBe(500);
    });
  });

  describe("getRewardSummaryForUserController", () => {
    const endpoint = `/api/rewards/summary/user`;

    it("401 - User not authenticated", async () => {
      const response = await request(app).get(endpoint);

      expect(response.status).toBe(401);
    });

    it("404 - User not found", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(RewardsService.prototype, "getUserRewardData")
        .mockResolvedValue(null);

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(404);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.error).toBe(STATUS_CODES[404]);
    });

    it("200 - Returns user reward summary", async () => {
      const mockUserRewardData = {
        userId: MOCK_USERS[0]._id,
        userName: MOCK_USERS[0].name,
        email: MOCK_USERS[0].email,
        currentPoints: 100,
        lifetimePoints: 500,
        totalImages: 2,
        totalPointsAwarded: 200,
        averagePointsPerImage: 100,
        rewards: [
          {
            imageId: MOCK_IMAGES[0]._id,
            uniqueProUsersCount: 10,
            totalPointsAwarded: 100,
            milestonesAchieved: 2,
          },
          {
            imageId: MOCK_IMAGES[1]._id,
            uniqueProUsersCount: 5,
            totalPointsAwarded: 100,
            milestonesAchieved: 1,
          },
        ],
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(RewardsService.prototype, "getUserRewardData")
        .mockResolvedValue(mockUserRewardData);

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.currentPoints).toBe(100);
      expect(response.body.data.lifetimePoints).toBe(500);
      expect(response.body.data.totalImages).toBe(2);
      expect(response.body.data.totalPointsAwarded).toBe(200);
    });

    it("500 - Service throws an error", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(RewardsService.prototype, "getUserRewardData")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(500);
    });
  });
});
