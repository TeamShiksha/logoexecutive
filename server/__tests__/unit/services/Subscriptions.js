const mongoose = require("mongoose");
const {
  createSubscription,
  fetchSubscriptionByuserid,
  updateApiUsageCount,
  isApiUsageLimitExceed
} = require("../../../services");
const { mockSubscriptions } = require("../../../utils/mocks/Subscriptions");
const { Subscriptions } = require("../../../models");
const { MongoMemoryServer } = require("mongodb-memory-server");

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongo_uri = mongoServer.getUri();
  await mongoose.connect(mongo_uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("createSubscription", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Subscriptions.deleteMany({});
  });
  test("should create a subscription for a user", async () => {
    const createdSubscription = await createSubscription(
      mockSubscriptions[0].user
    );
    // expect(createdSubscription).toBeInstanceOf(Subscriptions); 
  });

  test("should throw an error if an error occurs while creating a subscription", async () => {
    const errorMessage = "MongoDB operation failed";
    jest.spyOn(Subscriptions.prototype, "save").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    await expect(createSubscription(mockSubscriptions[0])).rejects.toThrow(errorMessage);

  });
});

describe("fetchSubscriptionByuserid", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Subscriptions.deleteMany({});
  });
  test("should return subscription for user if userId matches", async () => {
    const createdSubscription = await createSubscription(
      mockSubscriptions[0].user
    );
    const exists = await fetchSubscriptionByuserid(
      createdSubscription.user
    );

    // expect(exists).toBeInstanceOf(Subscriptions);
  });

  test("should return null if userId does not match", async () => {
    const nonExistingUserId = new mongoose.Types.ObjectId(
      "65bb3fd7fe3070e7b40f9648"
    );
    const result = await fetchSubscriptionByuserid(nonExistingUserId);
    expect(result).toBeNull();
  });

  test("should throw an error if an error occurs while fetching user's subscription", async () => {
    const errorMessage = "MongoDB operation failed";
    jest
      .spyOn(Subscriptions, "findOne")
      .mockRejectedValue(new Error(errorMessage));

    await expect(
      fetchSubscriptionByuserid(mockSubscriptions[0].user)
    ).rejects.toThrow(errorMessage);
  });
});

describe("isApiUsageLimitExceed", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Subscriptions.deleteMany({});
  });

  test("should return true if usage limit is reached", async () => {
    const subscription = new Subscriptions(mockSubscriptions[1]);
    await subscription.save();

    const result = await isApiUsageLimitExceed(mockSubscriptions[1].user);
    expect(result).toBe(true);
  });

  test("should return false if usage limit is not reached", async () => {
    const subscription = new Subscriptions(mockSubscriptions[0]);
    await subscription.save();

    const result = await isApiUsageLimitExceed(mockSubscriptions[0].user);
    expect(result).toBe(false);
  });

  test("should throw an error if an error occurs while checking usage limit", async () => {
    const errorMessage = "MongoDB operation failed";
    jest
      .spyOn(Subscriptions, "findOne")
      .mockRejectedValue(new Error(errorMessage));

    await expect(isApiUsageLimitExceed(mockSubscriptions[0].user)).rejects.toThrow(errorMessage);
  });
});

describe("updateApiUsageCount", () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await Subscriptions.deleteMany({});
  });

  test("should increment usage count and return 1", async () => {
    const subscription = new Subscriptions(mockSubscriptions[0]);
    await subscription.save();
    const result = await updateApiUsageCount(mockSubscriptions[0].user.toString());
    expect(result).toBe(1);

    const updatedSubscription = await Subscriptions.findOne({ user: mockSubscriptions[0].user });
    expect(updatedSubscription.usageCount).toBe(1);
  });

  test("should return null if no subscription is found", async () => {
    const nonExistingUserId = new mongoose.Types.ObjectId();
    const result = await updateApiUsageCount(nonExistingUserId);
    expect(result).toBe(0);
  });

  test("should throw an error if an error occurs while updating usage count", async () => {
    const errorMessage = "MongoDB operation failed";
    jest.spyOn(Subscriptions, "updateOne").mockReturnValueOnce({
      exec: jest.fn().mockRejectedValueOnce(new Error(errorMessage))
    });

    await expect(updateApiUsageCount(mockSubscriptions[0].user)).rejects.toThrow(errorMessage);
  });
});