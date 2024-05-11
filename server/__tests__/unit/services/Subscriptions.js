const {
  createSubscription,
  fetchSubscriptionByuserid,
} = require("../../../services");

const { mockUsers } = require("../../../utils/mocks/Users");
const { SubscriptionCollection } = require("../../../utils/firestore");

describe("createSubscription", () => {
  test("should create a subscription collection of a user", async () => {
    const createdSubscription = await createSubscription(mockUsers[0].userId);
    expect(createdSubscription.subscriptionId).toBeTruthy();
  });

  test("should throw an error if an error ocurrs while creating a subscription", async () => {
    const errorMessage = "Firestore operation failed";

    jest.spyOn(SubscriptionCollection, "doc").mockReturnValueOnce({
      set: jest.fn().mockRejectedValue(new Error(errorMessage)),
    });

    await expect(createSubscription(mockUsers[0].userId)).rejects.toThrow(
      errorMessage
    );
  });
});

describe("fetchSubscriptionByuserid", () => {
  test("should return subscription for user if userid matches", async () => {
    const fetchUsersSubscription = await fetchSubscriptionByuserid(
      mockUsers[0].userId
    );
    expect(fetchUsersSubscription.subscriptionId).toBeTruthy();
  });

  test("should return null if userid does not match", async () => {
    jest.spyOn(SubscriptionCollection, "where").mockReturnValue({
      limit: jest.fn().mockReturnValueOnce({
        get: jest.fn().mockResolvedValueOnce({ empty: true }),
      }),
    });
    const value = await fetchSubscriptionByuserid(mockUsers[1].userId);
    expect(value).toBeNull();
  });

  test("should throw  error if an error error ocurrs while fetching users subscription", async () => {
    const errorMessage = "Firestore operation failed";

    jest.spyOn(SubscriptionCollection, "where").mockReturnValue({
      limit: jest.fn().mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error(errorMessage)),
      }),
    });

    await expect(
      fetchSubscriptionByuserid(mockUsers[0].userId)
    ).rejects.toThrow(errorMessage);
  });
});
