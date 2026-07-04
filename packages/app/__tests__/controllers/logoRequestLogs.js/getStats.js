const request = require("supertest");
const { STATUS_CODES } = require("node:http");

const {
  LogoRequestLogsService,
  UserSessionService,
} = require("../../../services");
const {
  MOCK_WEEKLY_STATS,
  MOCK_MONTHLY_STATS,
  MOCK_USER_SESSIONS,
  MOCK_SESSION_ID,
  MOCK_USERS,
} = require("../../../utils/mocks");
const { Messages } = require("../../../utils/constants");
const app = require("../../../server");
const { Users } = require("../../../models");

describe("GET LOGO REQUEST STATS", () => {
  beforeAll(() => {
    process.env.CLIENT_PROXY_URL = "https://validcorsorigin.com";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete process.env.CLIENT_PROXY_URL;
  });

  describe("Weekly Stats", () => {
    it("200 - should return current week stats for authenticated user", async () => {
      const mockUserModel = new Users(MOCK_USERS[0]);
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(LogoRequestLogsService.prototype, "getWeeklyStats")
        .mockResolvedValue(MOCK_WEEKLY_STATS);

      const response = await request(app)
        .get("/api/logo-requests/stats?period=week")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        data: MOCK_WEEKLY_STATS,
      });
      expect(
        LogoRequestLogsService.prototype.getWeeklyStats
      ).toHaveBeenCalledWith(mockUserModel._id.toString());
    });

    it("200 - should return empty stats when user has no requests in the current week", async () => {
      const emptyStats = {
        period: "week",
        startDate: "2025-11-23",
        endDate: "2025-11-29",
        summary: {
          totalCount: 0,
          totalKB: "0.00",
        },
        data: [],
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(LogoRequestLogsService.prototype, "getWeeklyStats")
        .mockResolvedValue(emptyStats);

      const response = await request(app)
        .get("/api/logo-requests/stats?period=week")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.data.summary.totalCount).toBe(0);
      expect(response.body.data.data).toEqual([]);
    });
  });

  describe("Monthly Stats", () => {
    it("200 - should return current month stats for authenticated user", async () => {
      const mockUserModel = new Users(MOCK_USERS[0]);
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(LogoRequestLogsService.prototype, "getMonthlyStats")
        .mockResolvedValue(MOCK_MONTHLY_STATS);

      const response = await request(app)
        .get("/api/logo-requests/stats?period=month")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        statusCode: 200,
        data: MOCK_MONTHLY_STATS,
      });
      expect(
        LogoRequestLogsService.prototype.getMonthlyStats
      ).toHaveBeenCalledWith(mockUserModel._id.toString());
    });

    it("200 - should return empty stats when user has no requests in the current month", async () => {
      const emptyStats = {
        period: "month",
        startDate: "2025-11-01",
        endDate: "2025-11-30",
        summary: {
          totalCount: 0,
          totalKB: "0.00",
        },
        data: [],
      };

      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(LogoRequestLogsService.prototype, "getMonthlyStats")
        .mockResolvedValue(emptyStats);

      const response = await request(app)
        .get("/api/logo-requests/stats?period=month")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.data.summary.totalCount).toBe(0);
      expect(response.body.data.data).toEqual([]);
    });
  });

  describe("Validation Errors", () => {
    it("422 - should return validation error when period parameter is missing", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      const response = await request(app)
        .get("/api/logo-requests/stats")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(422);
      expect(response.body.statusCode).toBe(422);
      expect(response.body.error).toBe(STATUS_CODES[422]);
      expect(response.body.message).toContain("Period is required");
    });

    it("422 - should return validation error when period parameter is invalid", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      const response = await request(app)
        .get("/api/logo-requests/stats?period=invalid")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(422);
      expect(response.body.statusCode).toBe(422);
      expect(response.body.error).toBe(STATUS_CODES[422]);
      expect(response.body.message).toContain(
        "Period must be either 'week' or 'month'"
      );
    });

    it("422 - should return validation error for empty period parameter", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      const response = await request(app)
        .get("/api/logo-requests/stats?period=")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(422);
      expect(response.body.statusCode).toBe(422);
      expect(response.body.error).toBe(STATUS_CODES[422]);
    });
  });

  describe("Error Handling", () => {
    it("404 - should return not found when stats are null", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(LogoRequestLogsService.prototype, "getWeeklyStats")
        .mockResolvedValue(null);

      const response = await request(app)
        .get("/api/logo-requests/stats?period=week")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: Messages.DATA_NOT_FOUND,
      });
    });

    it("404 - should return not found when monthly stats are null", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(LogoRequestLogsService.prototype, "getMonthlyStats")
        .mockResolvedValue(null);

      const response = await request(app)
        .get("/api/logo-requests/stats?period=month")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: Messages.DATA_NOT_FOUND,
      });
    });

    it("500 - should handle unexpected errors during weekly stats fetch", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(LogoRequestLogsService.prototype, "getWeeklyStats")
        .mockImplementation(() => {
          throw new Error("Unexpected database error");
        });

      const response = await request(app)
        .get("/api/logo-requests/stats?period=week")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(500);
    });

    it("500 - should handle unexpected errors during monthly stats fetch", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(LogoRequestLogsService.prototype, "getMonthlyStats")
        .mockImplementation(() => {
          throw new Error("Unexpected database error");
        });

      const response = await request(app)
        .get("/api/logo-requests/stats?period=month")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(500);
    });
  });

  describe("Authentication", () => {
    it("401 - should return unauthorized when SessionId is missing", async () => {
      const response = await request(app).get(
        "/api/logo-requests/stats?period=week"
      );

      expect(response.status).toBe(401);
    });

    it("401 - should return error when SessionId is invalid", async () => {
      const response = await request(app)
        .get("/api/logo-requests/stats?period=week")
        .set("Cookie", `sessionId=invalid_session_id`);

      expect(response.status).toBe(401);
    });
  });

  describe("Edge Cases", () => {
    it("should handle case-sensitive period parameter", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      const response = await request(app)
        .get("/api/logo-requests/stats?period=Week")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(422);
      expect(response.body.message).toContain(
        "Period must be either 'week' or 'month'"
      );
    });

    it("should handle additional query parameters gracefully", async () => {
      jest
        .spyOn(UserSessionService.prototype, "validateSession")
        .mockResolvedValue(MOCK_USER_SESSIONS[0]);
      jest
        .spyOn(LogoRequestLogsService.prototype, "getWeeklyStats")
        .mockResolvedValue(MOCK_WEEKLY_STATS);

      const response = await request(app)
        .get("/api/logo-requests/stats?period=week&extra=param")
        .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(MOCK_WEEKLY_STATS);
    });
  });
});
