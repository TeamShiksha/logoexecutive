const Subscriptions = require("../../models/subscriptions");
const {
  SubscriptionsRepository,
  SubscriptionLogRepository,
} = require("../../repositories");
const SubscriptionService = require("../../services/subscriptions");
const { MOCK_SUBSCRIPTION } = require("../../utils/mocks");
const {
  DefaultSubscriptionPlan,
  ProSubscriptionPlan,
} = require("../../utils/constants");

describe("Subscription Service", () => {
  let subscriptionService;
  beforeEach(() => {
    subscriptionService = new SubscriptionService();
    jest.clearAllMocks();
  });

  it("should create a new subscription using default plan", async () => {
    const subscription = new Subscriptions(MOCK_SUBSCRIPTION[0]);

    jest
      .spyOn(SubscriptionsRepository.prototype, "create")
      .mockResolvedValue(subscription);
    const result = await subscriptionService.createSubscription();

    expect(result).toBeDefined();
    expect(result.key_limit).toBe(2);
  });

  it("get a subscription", async () => {
    const subscription = new Subscriptions(MOCK_SUBSCRIPTION[0]);
    const spy = jest
      .spyOn(SubscriptionsRepository.prototype, "getById")
      .mockResolvedValue(subscription);

    const result = await subscriptionService.getSubscription(subscription.id);
    expect(result).toBeDefined();
    expect(result.key_limit).toBe(2);
    expect(result.usage_limit).toBe(5000);
    expect(spy).toHaveBeenCalledWith(subscription.id, { session: undefined });
  });

  it("Return null for invalid subscription id", async () => {
    const subscriptionId = "invalid-id";
    const spy = jest
      .spyOn(SubscriptionsRepository.prototype, "getById")
      .mockResolvedValue(null);

    const result = await subscriptionService.getSubscription(subscriptionId);
    expect(result).toBe(null);
    expect(spy).toHaveBeenCalledWith(subscriptionId, { session: undefined });
  });

  it("Get total usage count for all subscriptions", async () => {
    const subscriptionCount = MOCK_SUBSCRIPTION.reduce(
      (totalCount, currentSubscription) => {
        return totalCount + currentSubscription.usage_count;
      },
      0
    );
    const spy = jest
      .spyOn(SubscriptionsRepository.prototype, "getSubscriptionUsageCount")
      .mockResolvedValue(subscriptionCount);

    const result = await subscriptionService.getSubscriptionUsageCount();
    expect(result).toBeDefined();
    expect(result).toBe(subscriptionCount);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("increment usage count for a subscription", async () => {
    const subscription = new Subscriptions(MOCK_SUBSCRIPTION[0]);
    const updatedSubscription = {
      ...subscription.toObject(),
      usage_count: subscription.usage_count + 1,
    };
    jest
      .spyOn(SubscriptionsRepository.prototype, "update")
      .mockResolvedValue(updatedSubscription);

    const result = await subscriptionService.incrementUsageCount(subscription);

    expect(result).toBeDefined();
    expect(result.usage_count).toBe(1);
  });

  it("should change subscription plan to PRO", async () => {
    const subscriptionId = MOCK_SUBSCRIPTION[0]._id;
    const updatedSub = {
      ...MOCK_SUBSCRIPTION[0],
      type: ProSubscriptionPlan.type,
      key_limit: ProSubscriptionPlan.key_limit,
      usage_limit: ProSubscriptionPlan.usage_limit,
      is_active: ProSubscriptionPlan.is_active,
    };
    const spy = jest
      .spyOn(SubscriptionsRepository.prototype, "findOneAndUpdate")
      .mockResolvedValue(updatedSub);

    const result = await subscriptionService.changeSubscriptionPlan(
      subscriptionId,
      "PRO"
    );

    expect(result.type).toBe("PRO");
    expect(result.key_limit).toBe(ProSubscriptionPlan.key_limit);
    expect(result.usage_limit).toBe(ProSubscriptionPlan.usage_limit);
    expect(spy).toHaveBeenCalledWith(
      { _id: subscriptionId },
      expect.objectContaining({
        $set: expect.objectContaining({
          type: ProSubscriptionPlan.type,
          key_limit: ProSubscriptionPlan.key_limit,
          usage_limit: ProSubscriptionPlan.usage_limit,
        }),
      }),
      { new: true, runValidators: true }
    );
  });

  it("should change subscription plan to HOBBY (downgrade)", async () => {
    const subscriptionId = MOCK_SUBSCRIPTION[1]._id;
    const updatedSub = {
      ...MOCK_SUBSCRIPTION[1],
      type: DefaultSubscriptionPlan.type,
      key_limit: DefaultSubscriptionPlan.key_limit,
      usage_limit: DefaultSubscriptionPlan.usage_limit,
    };
    jest
      .spyOn(SubscriptionsRepository.prototype, "findOneAndUpdate")
      .mockResolvedValue(updatedSub);

    const result = await subscriptionService.changeSubscriptionPlan(
      subscriptionId,
      "HOBBY"
    );

    expect(result.type).toBe("HOBBY");
    expect(result.key_limit).toBe(DefaultSubscriptionPlan.key_limit);
  });

  it("should create a subscription audit log", async () => {
    const logData = {
      user_id: "user123",
      changed_by: "admin456",
      reason: "Upgrade requested",
    };
    const spy = jest
      .spyOn(SubscriptionLogRepository.prototype, "create")
      .mockResolvedValue(logData);

    const result = await subscriptionService.createSubscriptionLog(logData);

    expect(result).toEqual(logData);
    expect(spy).toHaveBeenCalledWith(logData);
  });

  describe("Session propagation", () => {
    it("getSubscription forwards session to repository getById", async () => {
      const subscriptionId = MOCK_SUBSCRIPTION[0]._id;
      const mockSession = { id: "mock-session" };
      const spy = jest
        .spyOn(SubscriptionsRepository.prototype, "getById")
        .mockResolvedValue(MOCK_SUBSCRIPTION[0]);

      await subscriptionService.getSubscription(subscriptionId, {
        session: mockSession,
      });

      expect(spy).toHaveBeenCalledWith(subscriptionId, {
        session: mockSession,
      });
    });

    it("getSubscription without session passes undefined session to repository", async () => {
      const subscriptionId = MOCK_SUBSCRIPTION[0]._id;
      const spy = jest
        .spyOn(SubscriptionsRepository.prototype, "getById")
        .mockResolvedValue(MOCK_SUBSCRIPTION[0]);

      await subscriptionService.getSubscription(subscriptionId);

      expect(spy).toHaveBeenCalledWith(subscriptionId, {
        session: undefined,
      });
    });

    it("changeSubscriptionPlan forwards session to repository findOneAndUpdate", async () => {
      const subscriptionId = MOCK_SUBSCRIPTION[0]._id;
      const mockSession = { id: "mock-session" };
      const spy = jest
        .spyOn(SubscriptionsRepository.prototype, "findOneAndUpdate")
        .mockResolvedValue(MOCK_SUBSCRIPTION[1]);

      await subscriptionService.changeSubscriptionPlan(subscriptionId, "PRO", {
        session: mockSession,
      });

      expect(spy).toHaveBeenCalledWith(
        { _id: subscriptionId },
        expect.objectContaining({
          $set: expect.objectContaining({ type: "PRO" }),
        }),
        expect.objectContaining({ session: mockSession })
      );
    });

    it("changeSubscriptionPlan without session omits session from options", async () => {
      const subscriptionId = MOCK_SUBSCRIPTION[0]._id;
      const spy = jest
        .spyOn(SubscriptionsRepository.prototype, "findOneAndUpdate")
        .mockResolvedValue(MOCK_SUBSCRIPTION[1]);

      await subscriptionService.changeSubscriptionPlan(subscriptionId, "PRO");

      expect(spy).toHaveBeenCalledWith(
        { _id: subscriptionId },
        expect.any(Object),
        { new: true, runValidators: true }
      );
    });

    it("createSubscriptionLog forwards session to repository create", async () => {
      const logData = { user_id: "user123", changed_by: "admin456" };
      const mockSession = { id: "mock-session" };
      const spy = jest
        .spyOn(SubscriptionLogRepository.prototype, "create")
        .mockResolvedValue(logData);

      await subscriptionService.createSubscriptionLog(logData, {
        session: mockSession,
      });

      expect(spy).toHaveBeenCalledWith(logData, { session: mockSession });
    });

    it("createSubscriptionLog without session does not pass session to repository", async () => {
      const logData = { user_id: "user123", changed_by: "admin456" };
      const spy = jest
        .spyOn(SubscriptionLogRepository.prototype, "create")
        .mockResolvedValue(logData);

      await subscriptionService.createSubscriptionLog(logData);

      expect(spy).toHaveBeenCalledWith(logData);
    });
  });
});
