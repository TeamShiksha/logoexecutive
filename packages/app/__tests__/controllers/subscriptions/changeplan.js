const request = require("supertest");
const { STATUS_CODES } = require("node:http");
const mongoose = require("mongoose");
const { UserSessionService } = require("../../../services");
const SubscriptionService = require("../../../services/subscriptions");
const UsersService = require("../../../services/users");
const {
  MOCK_USERS,
  MOCK_SUBSCRIPTION,
  MOCK_SESSION_ID,
  MOCK_USER_SESSIONS,
} = require("../../../utils/mocks");
const { Messages } = require("../../../utils/constants");
const app = require("../../../server");

const ADMIN_SESSION = MOCK_USER_SESSIONS[2]; // ADMIN user session
const VALID_USER_ID = MOCK_USERS[1]._id.toString();

describe("PATCH /api/admin/users/:userId/subscription", () => {
  beforeAll(() => {
    process.env.CLIENT_PROXY_URL = "https://validcorsorigin.com";
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(ADMIN_SESSION);

    const mockSession = {
      withTransaction: jest.fn(async (fn) => await fn()),
      endSession: jest.fn(),
    };
    jest.spyOn(mongoose, "startSession").mockResolvedValue(mockSession);
  });
  afterAll(() => {
    delete process.env.CLIENT_PROXY_URL;
  });

  it("422 - invalid body (missing plan)", async () => {
    const response = await request(app)
      .patch(`/api/admin/users/${VALID_USER_ID}/subscription`)
      .send({})
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(422);
    expect(response.body.statusCode).toBe(422);
    expect(response.body.error).toBe(STATUS_CODES[422]);
  });

  it("422 - invalid plan value", async () => {
    const response = await request(app)
      .patch(`/api/admin/users/${VALID_USER_ID}/subscription`)
      .send({ plan: "INVALID" })
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(422);
    expect(response.body.statusCode).toBe(422);
  });

  it("400 - invalid userId format", async () => {
    const response = await request(app)
      .patch("/api/admin/users/not-a-valid-id/subscription")
      .send({ plan: "PRO" })
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(Messages.INVALID_USER_ID);
  });

  it("404 - user not found", async () => {
    jest.spyOn(UsersService.prototype, "getUser").mockResolvedValue(null);

    const response = await request(app)
      .patch(`/api/admin/users/${VALID_USER_ID}/subscription`)
      .send({ plan: "PRO" })
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(Messages.USER_NOT_FOUND);
  });

  it("404 - subscription not found", async () => {
    jest.spyOn(UsersService.prototype, "getUser").mockResolvedValue({
      _id: MOCK_USERS[1]._id,
      subscription_id: new mongoose.Types.ObjectId(),
    });
    jest
      .spyOn(SubscriptionService.prototype, "getSubscription")
      .mockResolvedValue(null);

    const response = await request(app)
      .patch(`/api/admin/users/${VALID_USER_ID}/subscription`)
      .send({ plan: "PRO" })
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Subscription not found.");
  });

  it("400 - same plan (no-op)", async () => {
    jest.spyOn(UsersService.prototype, "getUser").mockResolvedValue({
      _id: MOCK_USERS[1]._id,
      subscription_id: MOCK_SUBSCRIPTION[0]._id,
    });
    jest
      .spyOn(SubscriptionService.prototype, "getSubscription")
      .mockResolvedValue({ ...MOCK_SUBSCRIPTION[0], type: "HOBBY" });

    const response = await request(app)
      .patch(`/api/admin/users/${VALID_USER_ID}/subscription`)
      .send({ plan: "HOBBY" })
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(Messages.PLAN_ALREADY_ACTIVE);
  });

  it("200 - upgrade to PRO (creates audit log)", async () => {
    const updatedSub = { ...MOCK_SUBSCRIPTION[1] };
    jest.spyOn(UsersService.prototype, "getUser").mockResolvedValue({
      _id: MOCK_USERS[1]._id,
      subscription_id: MOCK_SUBSCRIPTION[0]._id,
    });
    jest
      .spyOn(SubscriptionService.prototype, "getSubscription")
      .mockResolvedValue({ ...MOCK_SUBSCRIPTION[0], type: "HOBBY" });
    jest
      .spyOn(SubscriptionService.prototype, "changeSubscriptionPlan")
      .mockResolvedValue(updatedSub);
    const logSpy = jest
      .spyOn(SubscriptionService.prototype, "createSubscriptionLog")
      .mockResolvedValue({});

    const response = await request(app)
      .patch(`/api/admin/users/${VALID_USER_ID}/subscription`)
      .send({ plan: "PRO", reason: "Upgrade requested" })
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(Messages.PLAN_CHANGE_SUCCESS);
    expect(response.body.data).toBeDefined();
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: MOCK_USERS[1]._id,
        subscription_id: MOCK_SUBSCRIPTION[0]._id,
        from_plan: "HOBBY",
        to_plan: "PRO",
        reason: "Upgrade requested",
      }),
      expect.objectContaining({ session: expect.any(Object) })
    );
  });

  it("200 - downgrade to HOBBY", async () => {
    const updatedSub = { ...MOCK_SUBSCRIPTION[0] };
    jest.spyOn(UsersService.prototype, "getUser").mockResolvedValue({
      _id: MOCK_USERS[1]._id,
      subscription_id: MOCK_SUBSCRIPTION[1]._id,
    });
    jest
      .spyOn(SubscriptionService.prototype, "getSubscription")
      .mockResolvedValue({ ...MOCK_SUBSCRIPTION[1], type: "PRO" });
    jest
      .spyOn(SubscriptionService.prototype, "changeSubscriptionPlan")
      .mockResolvedValue(updatedSub);
    const logSpy = jest
      .spyOn(SubscriptionService.prototype, "createSubscriptionLog")
      .mockResolvedValue({});

    const response = await request(app)
      .patch(`/api/admin/users/${VALID_USER_ID}/subscription`)
      .send({ plan: "HOBBY" })
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(Messages.PLAN_CHANGE_SUCCESS);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: MOCK_USERS[1]._id,
        subscription_id: MOCK_SUBSCRIPTION[1]._id,
        from_plan: "PRO",
        to_plan: "HOBBY",
      }),
      expect.objectContaining({ session: expect.any(Object) })
    );
  });

  it("500 - unexpected error", async () => {
    jest.spyOn(UsersService.prototype, "getUser").mockImplementation(() => {
      throw new Error("DB crash");
    });

    const response = await request(app)
      .patch(`/api/admin/users/${VALID_USER_ID}/subscription`)
      .send({ plan: "PRO" })
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(500);
  });

  it("401 - non-admin user rejected", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[0]); // CUSTOMER session

    const response = await request(app)
      .patch(`/api/admin/users/${VALID_USER_ID}/subscription`)
      .send({ plan: "PRO" })
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(401);
  });

  it("passes session to getSubscription and changeSubscriptionPlan", async () => {
    const updatedSub = { ...MOCK_SUBSCRIPTION[1] };
    const getUserSpy = jest
      .spyOn(UsersService.prototype, "getUser")
      .mockResolvedValue({
        _id: MOCK_USERS[1]._id,
        subscription_id: MOCK_SUBSCRIPTION[0]._id,
      });
    const getSubSpy = jest
      .spyOn(SubscriptionService.prototype, "getSubscription")
      .mockResolvedValue({ ...MOCK_SUBSCRIPTION[0], type: "HOBBY" });
    const changeSpy = jest
      .spyOn(SubscriptionService.prototype, "changeSubscriptionPlan")
      .mockResolvedValue(updatedSub);
    jest
      .spyOn(SubscriptionService.prototype, "createSubscriptionLog")
      .mockResolvedValue({});

    await request(app)
      .patch(`/api/admin/users/${VALID_USER_ID}/subscription`)
      .send({ plan: "PRO" })
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    const { session } = getUserSpy.mock.calls[0][1];
    expect(session).toBeDefined();
    expect(getSubSpy).toHaveBeenCalledWith(MOCK_SUBSCRIPTION[0]._id, {
      session,
    });
    expect(changeSpy).toHaveBeenCalledWith(MOCK_SUBSCRIPTION[0]._id, "PRO", {
      session,
    });
  });

  it("500 - transaction rolls back when createSubscriptionLog fails", async () => {
    jest.spyOn(UsersService.prototype, "getUser").mockResolvedValue({
      _id: MOCK_USERS[1]._id,
      subscription_id: MOCK_SUBSCRIPTION[0]._id,
    });
    jest
      .spyOn(SubscriptionService.prototype, "getSubscription")
      .mockResolvedValue({ ...MOCK_SUBSCRIPTION[0], type: "HOBBY" });
    jest
      .spyOn(SubscriptionService.prototype, "changeSubscriptionPlan")
      .mockResolvedValue({ ...MOCK_SUBSCRIPTION[1] });
    jest
      .spyOn(SubscriptionService.prototype, "createSubscriptionLog")
      .mockRejectedValue(new Error("Log creation failed"));

    const response = await request(app)
      .patch(`/api/admin/users/${VALID_USER_ID}/subscription`)
      .send({ plan: "PRO" })
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`);

    expect(response.status).toBe(500);
  });
});
