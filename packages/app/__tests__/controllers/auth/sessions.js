const request = require("supertest");
const { UserSessionService } = require("../../../services");
const { ENDPOINTS } = require("../../../utils/testconstants");
const {
  MOCK_USER_SESSIONS,
  MOCK_SESSION_ID,
  MOCK_SESSION_ID_2,
} = require("../../../utils/mocks");
const { Messages } = require("../../../utils/constants");
const app = require("../../../server");

describe("SESSION MANAGEMENT API", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default valid session mock
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[0]);
  });

  describe("GET /api/auth/sessions", () => {
    it("200 - List active sessions", async () => {
      const activeSessions = [MOCK_USER_SESSIONS[0], MOCK_USER_SESSIONS[1]];

      jest
        .spyOn(UserSessionService.prototype, "getActiveSessions")
        .mockResolvedValue(activeSessions);

      const response = await request(app)
        .get(ENDPOINTS.SESSIONS)
        .set("Cookie", [`sessionId=${MOCK_SESSION_ID}`]);

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(2);
      expect(response.body.sessions[0].isCurrent).toBe(true);
    });
  });

  describe("DELETE /api/auth/sessions/:sessionId", () => {
    it("400 - Cannot revoke current session", async () => {
      const response = await request(app)
        .delete(`${ENDPOINTS.SESSIONS}/${MOCK_SESSION_ID}`)
        .set("Cookie", [`sessionId=${MOCK_SESSION_ID}`]);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        Messages.CANNOT_REVOKE_CURRENT_SESSION
      );
    });

    it("404 - Session not found or unauthorized", async () => {
      jest
        .spyOn(UserSessionService.prototype, "revokeSession")
        .mockResolvedValue(null);

      const response = await request(app)
        .delete(`${ENDPOINTS.SESSIONS}/${MOCK_SESSION_ID_2}`)
        .set("Cookie", [`sessionId=${MOCK_SESSION_ID}`]);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(Messages.SESSION_NOT_FOUND);
    });

    it("200 - Session revoked successfully", async () => {
      jest
        .spyOn(UserSessionService.prototype, "revokeSession")
        .mockResolvedValue({ isActive: false });

      const response = await request(app)
        .delete(`${ENDPOINTS.SESSIONS}/${MOCK_SESSION_ID_2}`)
        .set("Cookie", [`sessionId=${MOCK_SESSION_ID}`]);

      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/auth/signout/others", () => {
    it("200 - Revokes all other sessions", async () => {
      jest
        .spyOn(UserSessionService.prototype, "revokeOtherSessions")
        .mockResolvedValue({ modifiedCount: 2 });

      const response = await request(app)
        .post(ENDPOINTS.SIGNOUT_OTHERS)
        .set("Cookie", [`sessionId=${MOCK_SESSION_ID}`]);

      expect(response.status).toBe(200);
      expect(response.body.revokedCount).toBe(2);
    });
  });

  describe("POST /api/auth/signout/all", () => {
    it("205 - Revokes all sessions and clears cookie", async () => {
      jest
        .spyOn(UserSessionService.prototype, "signoutAll")
        .mockResolvedValue({ modifiedCount: 3 });

      const response = await request(app)
        .post(ENDPOINTS.SIGNOUT_ALL)
        .set("Cookie", [`sessionId=${MOCK_SESSION_ID}`]);

      expect(response.status).toBe(205);
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/sessionId=;/);
    });
  });
});
