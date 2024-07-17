const mongoose = require("mongoose");
const {
  createSubscription,
  fetchSubscriptionByuserid,
} = require("../../../services");
const { mockSubscriptions } = require("../../../utils/mocks/Subscriptions");
const { Subscriptions } = require("../../../models");

require("dotenv").config();

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI);
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
    console.log(createdSubscription);
    expect(createdSubscription).toBeInstanceOf(Subscriptions); 
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

    expect(exists).toBeInstanceOf(Subscriptions);
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

