/**
 * Rewards Bonus Points Controller Tests
 *
 * Tests for admin-only bonus points awarding.
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { RewardsService } = require("../../../services");
const { UserSessionService } = require("../../../services");
const {
  MOCK_SESSION_ID,
  MOCK_USERS,
  MOCK_IMAGES,
} = require("../../../utils/mocks");

const MOCK_BONUS_POINTS_AWARD = {
  success: true,
  userId: MOCK_USERS[0]._id,
  pointsAwarded: 50,
  reason: "Referral bonus",
  transactionId: new mongoose.Types.ObjectId(),
  newBalance: 190,
};
const app = require("../../../server");

describe("Rewards Controller - Bonus Points", () => {
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

  describe("awardBonusPointsController", () => {
    const endpoint = `/api/admin/rewards/bonus`;

    it("401 - User not authenticated", async () => {
      const response = await request(app).post(endpoint).send({
        imageId: MOCK_IMAGES[0]._id.toString(),
        userId: MOCK_USERS[0]._id.toString(),
        points: 50,
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
          imageId: MOCK_IMAGES[0]._id.toString(),
          userId: MOCK_USERS[0]._id.toString(),
          points: 50,
        });

      expect(response.status).toBe(401);
    });

    it("400 - Missing required fields", async () => {
      const adminSession = { userId: MOCK_USERS[2] }; // Admin user;

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(adminSession);

      const response = await request(app)
        .post(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
        .send({
          imageId: MOCK_IMAGES[0]._id.toString(),
          // missing userId and points
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Missing required fields");
    });

    it("400 - Missing imageId", async () => {
      const adminSession = { userId: MOCK_USERS[2] };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(adminSession);

      const response = await request(app)
        .post(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
        .send({
          userId: MOCK_USERS[0]._id.toString(),
          points: 50,
          // missing imageId
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Missing required fields");
    });

    it("400 - Points must be greater than 0", async () => {
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
          imageId: MOCK_IMAGES[0]._id.toString(),
          userId: MOCK_USERS[0]._id.toString(),
          points: -5, // Negative points
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Points must be greater than 0");
    });

    it("201 - Bonus points awarded successfully", async () => {
      const adminSession = {
        userId: MOCK_USERS[2], // Admin user
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(adminSession);
      jest
        .spyOn(RewardsService.prototype, "awardBonusPoints")
        .mockResolvedValue(MOCK_BONUS_POINTS_AWARD);

      const response = await request(app)
        .post(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
        .send({
          imageId: MOCK_IMAGES[0]._id.toString(),
          userId: MOCK_USERS[0]._id.toString(),
          points: 50,
          reason: "Referral bonus",
          description: "Bonus for referral program",
        });

      expect(response.status).toBe(201);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe("Bonus points awarded successfully");
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.pointsAwarded).toBe(50);
      expect(response.body.data.newBalance).toBe(190);
    });

    it("500 - Service throws an error", async () => {
      const adminSession = {
        userId: MOCK_USERS[2], // Admin user
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(adminSession);
      jest
        .spyOn(RewardsService.prototype, "awardBonusPoints")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post(endpoint)
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
        .send({
          imageId: MOCK_IMAGES[0]._id.toString(),
          userId: MOCK_USERS[0]._id.toString(),
          points: 50,
        });

      expect(response.status).toBe(500);
    });
  });
});
