/**
 * Reward System Tests
 *
 * These tests demonstrate how to test the reward system implementation.
 * Tests use mocking to avoid database dependencies.
 */

const RewardTrackingService = require("../../services/rewardTransactions");
const RewardsService = require("../../services/rewards");
const { SubscriptionTypes } = require("../../utils/constants");
const mongoose = require("mongoose");
const {
  MOCK_USERS,
  MOCK_IMAGES,
  MOCK_LOG_ENTRY_HOBBY,
  MOCK_LOG_ENTRY_VALID,
  MOCK_MILESTONE_CONFIG,
} = require("../../utils/mocks");

const REWARD_TEST_IMAGE_ID = new mongoose.Types.ObjectId();
const REWARD_TEST_CREATOR_ID = new mongoose.Types.ObjectId();

const REWARD_TEST_PRO_USER_IDS_10 = Array.from(
  { length: 10 },
  () => new mongoose.Types.ObjectId()
);
const REWARD_TEST_PRO_USER_IDS_15 = Array.from(
  { length: 15 },
  () => new mongoose.Types.ObjectId()
);

const createMockRewardRecordEmpty = () => ({
  _id: new mongoose.Types.ObjectId(),
  image_id: REWARD_TEST_IMAGE_ID,
  user_id: REWARD_TEST_CREATOR_ID,
  unique_pro_users: [],
  unique_pro_users_count: 0,
  milestones_achieved: [],
  total_points_awarded: 0,
});

const createMockRewardRecord5Achieved = () => ({
  _id: new mongoose.Types.ObjectId(),
  image_id: REWARD_TEST_IMAGE_ID,
  user_id: REWARD_TEST_CREATOR_ID,
  unique_pro_users: REWARD_TEST_PRO_USER_IDS_10.slice(0, 5),
  unique_pro_users_count: 5,
  milestones_achieved: [
    { milestone: 5, achieved_at: new Date(), points_awarded: 10 },
  ],
  total_points_awarded: 10,
});

const MOCK_ELIGIBLE_LOG_ENTRIES_5 = REWARD_TEST_PRO_USER_IDS_10.slice(0, 5).map(
  (userId) => ({
    _id: new mongoose.Types.ObjectId(),
    user_id: userId,
    image_id: REWARD_TEST_IMAGE_ID,
    user_plan: SubscriptionTypes.PRO,
    is_reward_eligible: true,
    reward_eligibility_reason: "VALID",
    createdAt: new Date(),
  })
);

const MOCK_ELIGIBLE_LOG_ENTRIES_5_SECOND = REWARD_TEST_PRO_USER_IDS_10.slice(
  5,
  10
).map((userId) => ({
  _id: new mongoose.Types.ObjectId(),
  user_id: userId,
  image_id: REWARD_TEST_IMAGE_ID,
  user_plan: SubscriptionTypes.PRO,
  is_reward_eligible: true,
  reward_eligibility_reason: "VALID",
  createdAt: new Date(),
}));

const MOCK_ELIGIBLE_LOG_ENTRIES_15 = REWARD_TEST_PRO_USER_IDS_15.map(
  (userId) => ({
    _id: new mongoose.Types.ObjectId(),
    user_id: userId,
    image_id: REWARD_TEST_IMAGE_ID,
    user_plan: SubscriptionTypes.PRO,
    is_reward_eligible: true,
    reward_eligibility_reason: "VALID",
    createdAt: new Date(),
  })
);

const MOCK_REWARD_CREATOR_USER = {
  _id: REWARD_TEST_CREATOR_ID,
  name: "Creator User",
  email: "creator@example.com",
  reward_points_current: 0,
  reward_points_lifetime: 0,
};

const MOCK_REWARD_USER_WITH_POINTS = {
  _id: new mongoose.Types.ObjectId(),
  name: "Rewards User",
  email: "rewards@example.com",
  reward_points_current: 100,
  reward_points_lifetime: 500,
};

const MOCK_USER_REWARD_RECORDS = [
  {
    _id: new mongoose.Types.ObjectId(),
    image_id: MOCK_IMAGES[0]._id,
    user_id: MOCK_REWARD_USER_WITH_POINTS._id,
    unique_pro_users: Array.from(
      { length: 10 },
      () => new mongoose.Types.ObjectId()
    ),
    total_points_awarded: 20,
    milestones_achieved: [
      { milestone: 5, achieved_at: new Date(), points_awarded: 10 },
      { milestone: 10, achieved_at: new Date(), points_awarded: 10 },
    ],
  },
];

const MOCK_LOG_ENTRY_SELF_USAGE = {
  _id: new mongoose.Types.ObjectId(),
  user_plan: SubscriptionTypes.PRO,
  response_size_bytes: 0,
  is_reward_eligible: false,
  reward_eligibility_reason: "SELF_USAGE",
  createdAt: new Date(),
};

const MOCK_LOG_ENTRY_DUPLICATE = {
  _id: new mongoose.Types.ObjectId(),
  user_plan: SubscriptionTypes.PRO,
  response_size_bytes: 0,
  is_reward_eligible: false,
  reward_eligibility_reason: "DUPLICATE_USAGE",
  createdAt: new Date(),
};

const MOCK_UNREVERSED_TRANSACTION = {
  _id: new mongoose.Types.ObjectId(),
  image_id: MOCK_IMAGES[0]._id,
  user_id: MOCK_USERS[0]._id,
  transaction_type: "MILESTONE_REWARD",
  points_awarded: 10,
  is_reversed: false,
  description: "Milestone 5 reached",
};

const MOCK_REVERSED_TRANSACTION = {
  ...MOCK_UNREVERSED_TRANSACTION,
  is_reversed: true,
  reversed_at: new Date(),
  reversal_reason: "Abuse detected",
};

const MOCK_AGGREGATED_LEADERBOARD = [
  {
    userId: MOCK_USERS[0]._id,
    name: "Creator A",
    email: "a@example.com",
    totalPointsAwarded: 30,
    milestonesAchieved: 3,
  },
  {
    userId: MOCK_USERS[1]._id,
    name: "Creator B",
    email: "b@example.com",
    totalPointsAwarded: 20,
    milestonesAchieved: 2,
  },
  {
    userId: MOCK_USERS[2]._id,
    name: "Creator C",
    email: "c@example.com",
    totalPointsAwarded: 10,
    milestonesAchieved: 1,
  },
];

describe("Reward System", () => {
  let rewardsService;

  beforeEach(() => {
    jest.clearAllMocks();
    rewardsService = new RewardsService();
  });

  describe("RewardTrackingService.validateAndLogRequest", () => {
    let rewardTrackingService;

    beforeEach(() => {
      rewardTrackingService = new RewardTrackingService();
    });
    it("should mark Hobby user requests as non-eligible", async () => {
      jest
        .spyOn(rewardTrackingService.logoRequestLogsRepository, "create")
        .mockResolvedValue(MOCK_LOG_ENTRY_HOBBY);

      const result = await rewardTrackingService.validateAndLogRequest({
        imageId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        creatorId: new mongoose.Types.ObjectId(),
        keyId: new mongoose.Types.ObjectId(),
        subscriptionId: new mongoose.Types.ObjectId(),
        subscription: { type: SubscriptionTypes.HOBBY },
      });

      expect(result.is_reward_eligible).toBe(false);
      expect(result.reward_eligibility_reason).toBe("HOBBY_USER");
    });

    it("should mark self-usage as non-eligible", async () => {
      const userId = new mongoose.Types.ObjectId();

      jest
        .spyOn(rewardTrackingService.logoRequestLogsRepository, "create")
        .mockResolvedValue(MOCK_LOG_ENTRY_SELF_USAGE);

      const result = await rewardTrackingService.validateAndLogRequest({
        imageId: new mongoose.Types.ObjectId(),
        userId,
        creatorId: userId,
        keyId: new mongoose.Types.ObjectId(),
        subscriptionId: new mongoose.Types.ObjectId(),
        subscription: { type: SubscriptionTypes.PRO },
      });

      expect(result.is_reward_eligible).toBe(false);
      expect(result.reward_eligibility_reason).toBe("SELF_USAGE");
    });

    it("should mark duplicate requests as non-eligible", async () => {
      // Simulate an existing eligible log for the same image + user
      jest
        .spyOn(rewardTrackingService.logoRequestLogsRepository, "find")
        .mockResolvedValue([MOCK_LOG_ENTRY_VALID]);
      jest
        .spyOn(rewardTrackingService.logoRequestLogsRepository, "create")
        .mockResolvedValue(MOCK_LOG_ENTRY_DUPLICATE);

      const result = await rewardTrackingService.validateAndLogRequest({
        imageId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        creatorId: new mongoose.Types.ObjectId(),
        keyId: new mongoose.Types.ObjectId(),
        subscriptionId: new mongoose.Types.ObjectId(),
        subscription: { type: SubscriptionTypes.PRO },
      });

      expect(result.is_reward_eligible).toBe(false);
      expect(result.reward_eligibility_reason).toBe("DUPLICATE_USAGE");
    });

    it("should mark valid Pro user request as eligible", async () => {
      jest
        .spyOn(rewardTrackingService.logoRequestLogsRepository, "find")
        .mockResolvedValue([]);
      jest
        .spyOn(rewardTrackingService.logoRequestLogsRepository, "create")
        .mockResolvedValue(MOCK_LOG_ENTRY_VALID);
      jest
        .spyOn(rewardTrackingService.imagesRepository, "update")
        .mockResolvedValue({});

      const result = await rewardTrackingService.validateAndLogRequest({
        imageId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        creatorId: new mongoose.Types.ObjectId(),
        keyId: new mongoose.Types.ObjectId(),
        subscriptionId: new mongoose.Types.ObjectId(),
        subscription: { type: SubscriptionTypes.PRO },
      });

      expect(result.is_reward_eligible).toBe(true);
      expect(result.reward_eligibility_reason).toBe("VALID");
    });
  });

  describe("RewardsService.processRewardsForImage", () => {
    let createTransactionSpy;

    const setupProcessRewardsMocks = (eligibleLogs, rewardRecord) => {
      const mockSession = {
        withTransaction: jest.fn((cb) => cb()),
        endSession: jest.fn(),
      };
      jest.spyOn(mongoose, "startSession").mockResolvedValue(mockSession);

      jest
        .spyOn(rewardsService.milestoneConfigRepository, "findActive")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG);
      jest.spyOn(rewardsService.imagesRepository, "getById").mockResolvedValue({
        _id: REWARD_TEST_IMAGE_ID,
        user_id: MOCK_REWARD_CREATOR_USER._id,
        company_name: "GOOGLE",
      });
      jest
        .spyOn(rewardsService.logoRequestLogsRepository, "find")
        .mockResolvedValue(eligibleLogs);
      jest
        .spyOn(rewardsService.rewardsRepository, "findOrCreateByImageId")
        .mockResolvedValue(rewardRecord);
      jest
        .spyOn(rewardsService.rewardsRepository, "update")
        .mockResolvedValue({});
      jest
        .spyOn(rewardsService.usersRepository, "update")
        .mockResolvedValue({});
      createTransactionSpy = jest
        .spyOn(rewardsService.rewardTransactionsRepository, "createTransaction")
        .mockResolvedValue({});
      jest
        .spyOn(rewardsService.imagesRepository, "update")
        .mockResolvedValue({});
    };

    it("should award points when a single milestone is reached", async () => {
      // 5 new unique Pro users → milestone 5 (10 pts)
      setupProcessRewardsMocks(
        MOCK_ELIGIBLE_LOG_ENTRIES_5,
        createMockRewardRecordEmpty()
      );

      const result =
        await rewardsService.processRewardsForImage(REWARD_TEST_IMAGE_ID);

      expect(result.success).toBe(true);
      expect(result).toMatchObject({
        imageId: REWARD_TEST_IMAGE_ID,
        newUsersAdded: MOCK_ELIGIBLE_LOG_ENTRIES_5.length,
        totalPointsAwarded: 10,
        newMilestones: [
          expect.objectContaining({ milestone: 5, points_awarded: 10 }),
        ],
      });
      expect(result.newMilestones).toHaveLength(1);
      expect(createTransactionSpy).toHaveBeenCalledTimes(1);
      expect(createTransactionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction_type: "MILESTONE_REWARD",
          milestone: 5,
          points_awarded: 10,
        }),
        expect.any(Object)
      );
    });

    it("should award multiple milestones for high usage", async () => {
      // 15 new unique Pro users → milestones 5, 10, 15 (30 pts)
      setupProcessRewardsMocks(
        MOCK_ELIGIBLE_LOG_ENTRIES_15,
        createMockRewardRecordEmpty()
      );

      const result =
        await rewardsService.processRewardsForImage(REWARD_TEST_IMAGE_ID);

      expect(result.success).toBe(true);
      expect(result).toMatchObject({
        imageId: REWARD_TEST_IMAGE_ID,
        newUsersAdded: MOCK_ELIGIBLE_LOG_ENTRIES_15.length,
        totalPointsAwarded: 30,
        newMilestones: expect.arrayContaining([
          expect.objectContaining({ milestone: 5 }),
          expect.objectContaining({ milestone: 10 }),
          expect.objectContaining({ milestone: 15 }),
        ]),
      });
      expect(result.newMilestones).toHaveLength(3);
      expect(createTransactionSpy).toHaveBeenCalledTimes(3);
      expect(createTransactionSpy).toHaveBeenCalledWith(
        expect.objectContaining({ milestone: 5, points_awarded: 10 }),
        expect.any(Object)
      );
      expect(createTransactionSpy).toHaveBeenCalledWith(
        expect.objectContaining({ milestone: 10, points_awarded: 10 }),
        expect.any(Object)
      );
      expect(createTransactionSpy).toHaveBeenCalledWith(
        expect.objectContaining({ milestone: 15, points_awarded: 10 }),
        expect.any(Object)
      );
    });

    it("should not award duplicate milestones", async () => {
      setupProcessRewardsMocks(
        [...MOCK_ELIGIBLE_LOG_ENTRIES_5, ...MOCK_ELIGIBLE_LOG_ENTRIES_5_SECOND],
        createMockRewardRecord5Achieved()
      );

      const result =
        await rewardsService.processRewardsForImage(REWARD_TEST_IMAGE_ID);

      expect(result.success).toBe(true);
      expect(result).toMatchObject({
        imageId: REWARD_TEST_IMAGE_ID,
        totalPointsAwarded: 10,
        newMilestones: [
          expect.objectContaining({ milestone: 10, points_awarded: 10 }),
        ],
      });
      expect(result.newMilestones).toHaveLength(1);
      expect(createTransactionSpy).toHaveBeenCalledTimes(1);
      expect(createTransactionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction_type: "MILESTONE_REWARD",
          milestone: 10,
          points_awarded: 10,
        }),
        expect.any(Object)
      );
    });
  });

  describe("RewardsService internal helpers", () => {
    describe("_computeNewUsers", () => {
      it("returns all eligible requests as new when reward has no users", () => {
        const { newUsers, previousCount, newCount } =
          rewardsService._computeNewUsers(
            MOCK_ELIGIBLE_LOG_ENTRIES_5,
            createMockRewardRecordEmpty()
          );
        expect(newUsers).toHaveLength(5);
        expect(newUsers.map((u) => u.toString())).toEqual(
          REWARD_TEST_PRO_USER_IDS_10.slice(0, 5).map((u) => u.toString())
        );
        expect(previousCount).toBe(0);
        expect(newCount).toBe(5);
      });

      it("returns only delta users when some already tracked", () => {
        const eligibleRequests = [
          ...MOCK_ELIGIBLE_LOG_ENTRIES_5,
          ...MOCK_ELIGIBLE_LOG_ENTRIES_5_SECOND,
        ];
        const { newUsers, previousCount, newCount } =
          rewardsService._computeNewUsers(
            eligibleRequests,
            createMockRewardRecord5Achieved()
          );
        expect(newUsers).toHaveLength(5);
        expect(newUsers.map((u) => u.toString())).toEqual(
          REWARD_TEST_PRO_USER_IDS_10.slice(5, 10).map((u) => u.toString())
        );
        expect(previousCount).toBe(5);
        expect(newCount).toBe(10);
      });

      it("returns empty when all eligible requests already tracked", () => {
        const { newUsers, previousCount, newCount } =
          rewardsService._computeNewUsers(
            MOCK_ELIGIBLE_LOG_ENTRIES_5,
            createMockRewardRecord5Achieved()
          );
        expect(newUsers).toHaveLength(0);
        expect(previousCount).toBe(5);
        expect(newCount).toBe(5);
      });

      it("returns empty when eligible requests is empty", () => {
        const { newUsers, previousCount, newCount } =
          rewardsService._computeNewUsers([], createMockRewardRecordEmpty());
        expect(newUsers).toHaveLength(0);
        expect(previousCount).toBe(0);
        expect(newCount).toBe(0);
      });
    });

    describe("_computeNewMilestones", () => {
      it("returns milestones when newCount passes thresholds and none achieved", () => {
        const milestones = rewardsService._computeNewMilestones(
          15,
          createMockRewardRecordEmpty(),
          MOCK_MILESTONE_CONFIG
        );
        expect(milestones).toHaveLength(3);
        expect(milestones.map((m) => m.milestone)).toEqual([5, 10, 15]);
        expect(milestones.map((m) => m.points_awarded)).toEqual([10, 10, 10]);
      });

      it("returns only unachieved milestones when some already earned", () => {
        const milestones = rewardsService._computeNewMilestones(
          15,
          createMockRewardRecord5Achieved(),
          MOCK_MILESTONE_CONFIG
        );
        expect(milestones).toHaveLength(2);
        expect(milestones.map((m) => m.milestone)).toEqual([10, 15]);
      });

      it("returns empty when newCount below first threshold", () => {
        const milestones = rewardsService._computeNewMilestones(
          3,
          createMockRewardRecordEmpty(),
          MOCK_MILESTONE_CONFIG
        );
        expect(milestones).toHaveLength(0);
      });

      it("returns empty when all milestones already achieved", () => {
        const rewardWithAllMilestones = {
          ...createMockRewardRecord5Achieved(),
          unique_pro_users_count: 100,
          milestones_achieved: [5, 10, 15, 20, 25, 50, 100].map((at) => ({
            milestone: at,
            achieved_at: new Date(),
            points_awarded: 10,
          })),
        };
        const milestones = rewardsService._computeNewMilestones(
          150,
          rewardWithAllMilestones,
          MOCK_MILESTONE_CONFIG
        );
        expect(milestones).toHaveLength(0);
      });

      it("handles exact boundary at threshold value", () => {
        const milestones = rewardsService._computeNewMilestones(
          5,
          createMockRewardRecordEmpty(),
          MOCK_MILESTONE_CONFIG
        );
        expect(milestones).toHaveLength(1);
        expect(milestones[0].milestone).toBe(5);
      });
    });

    describe("_buildResult", () => {
      const imageId = REWARD_TEST_IMAGE_ID;
      const creatorId = REWARD_TEST_CREATOR_ID;

      it("returns no-new-users shape when newUsers is empty", () => {
        const result = rewardsService._buildResult(
          imageId,
          creatorId,
          5,
          5,
          [],
          [],
          0
        );
        expect(result).toEqual({
          success: true,
          imageId,
          creatorId,
          newUsersAdded: 0,
          newMilestones: [],
          totalPointsAwarded: 0,
          message: "No new users found",
        });
      });

      it("includes message when newUsers exist but no milestones", () => {
        const result = rewardsService._buildResult(
          imageId,
          creatorId,
          0,
          5,
          [1, 2, 3, 4, 5],
          [],
          0
        );
        expect(result).toMatchObject({
          success: true,
          imageId,
          creatorId,
          newUsersAdded: 5,
          previousUniqueCount: 0,
          newUniqueCount: 5,
          newMilestones: [],
          totalPointsAwarded: 0,
          message: "Added 5 new users, no milestones reached",
        });
      });

      it("returns milestone details with no message when milestones present", () => {
        const milestones = [
          { milestone: 5, achieved_at: new Date(), points_awarded: 10 },
        ];
        const result = rewardsService._buildResult(
          imageId,
          creatorId,
          0,
          5,
          [1, 2, 3, 4, 5],
          milestones,
          10
        );
        expect(result).toMatchObject({
          success: true,
          imageId,
          creatorId,
          newUsersAdded: 5,
          previousUniqueCount: 0,
          newUniqueCount: 5,
          newMilestones: milestones,
          totalPointsAwarded: 10,
        });
        expect(result.message).toBeUndefined();
      });
    });

    describe("_loadRewardData", () => {
      const mockSession = {};

      it("loads all data successfully", async () => {
        jest
          .spyOn(rewardsService.milestoneConfigRepository, "findActive")
          .mockResolvedValue(MOCK_MILESTONE_CONFIG);
        jest
          .spyOn(rewardsService.imagesRepository, "getById")
          .mockResolvedValue({
            _id: REWARD_TEST_IMAGE_ID,
            user_id: REWARD_TEST_CREATOR_ID,
          });
        jest
          .spyOn(rewardsService.logoRequestLogsRepository, "find")
          .mockResolvedValue(MOCK_ELIGIBLE_LOG_ENTRIES_5);
        jest
          .spyOn(rewardsService.rewardsRepository, "findOrCreateByImageId")
          .mockResolvedValue(createMockRewardRecordEmpty());

        const result = await rewardsService._loadRewardData(
          REWARD_TEST_IMAGE_ID,
          mockSession
        );

        expect(result).toHaveProperty("milestoneConfig");
        expect(result).toHaveProperty("image");
        expect(result).toHaveProperty("eligibleRequests");
        expect(result).toHaveProperty("reward");
      });

      it("throws when milestoneConfig not found", async () => {
        jest
          .spyOn(rewardsService.milestoneConfigRepository, "findActive")
          .mockResolvedValue(null);

        await expect(
          rewardsService._loadRewardData(REWARD_TEST_IMAGE_ID, mockSession)
        ).rejects.toThrow("No active MilestoneConfig found. Aborting.");
      });

      it("throws when image not found", async () => {
        jest
          .spyOn(rewardsService.milestoneConfigRepository, "findActive")
          .mockResolvedValue(MOCK_MILESTONE_CONFIG);
        jest
          .spyOn(rewardsService.imagesRepository, "getById")
          .mockResolvedValue(null);

        await expect(
          rewardsService._loadRewardData(REWARD_TEST_IMAGE_ID, mockSession)
        ).rejects.toThrow("Image not found");
      });
    });

    describe("_applyRewardUpdates", () => {
      const creatorId = REWARD_TEST_CREATOR_ID;
      const session = {};
      let rewardsUpdateSpy;
      let usersUpdateSpy;
      let imagesUpdateSpy;

      beforeEach(() => {
        rewardsUpdateSpy = jest
          .spyOn(rewardsService.rewardsRepository, "update")
          .mockResolvedValue({});
        usersUpdateSpy = jest
          .spyOn(rewardsService.usersRepository, "update")
          .mockResolvedValue({});
        imagesUpdateSpy = jest
          .spyOn(rewardsService.imagesRepository, "update")
          .mockResolvedValue({});
      });

      it("updates reward and image when no milestones", async () => {
        const reward = createMockRewardRecordEmpty();
        const newUsers = REWARD_TEST_PRO_USER_IDS_10.slice(0, 5);

        await rewardsService._applyRewardUpdates(
          reward,
          creatorId,
          REWARD_TEST_IMAGE_ID,
          newUsers,
          [],
          0,
          session
        );

        expect(rewardsUpdateSpy).toHaveBeenCalledWith(
          reward._id,
          expect.objectContaining({
            $push: { unique_pro_users: { $each: newUsers } },
            $inc: { unique_pro_users_count: 5 },
          }),
          { session }
        );
        expect(rewardsUpdateSpy.mock.calls[0][1].$addToSet).toBeUndefined();
        expect(usersUpdateSpy).not.toHaveBeenCalled();
        expect(imagesUpdateSpy).toHaveBeenCalled();
      });

      it("updates reward, user, and image when milestones present", async () => {
        const reward = createMockRewardRecordEmpty();
        const newUsers = REWARD_TEST_PRO_USER_IDS_10.slice(0, 5);
        const newMilestones = [
          { milestone: 5, achieved_at: new Date(), points_awarded: 10 },
        ];

        await rewardsService._applyRewardUpdates(
          reward,
          creatorId,
          REWARD_TEST_IMAGE_ID,
          newUsers,
          newMilestones,
          10,
          session
        );

        expect(rewardsUpdateSpy).toHaveBeenCalledWith(
          reward._id,
          expect.objectContaining({
            $push: { unique_pro_users: { $each: newUsers } },
            $inc: {
              unique_pro_users_count: 5,
              total_points_awarded: 10,
            },
            $addToSet: {
              milestones_achieved: { $each: newMilestones },
            },
          }),
          { session }
        );
        expect(usersUpdateSpy).toHaveBeenCalledWith(
          creatorId,
          expect.objectContaining({
            $inc: {
              reward_points_current: 10,
              reward_points_lifetime: 10,
            },
          }),
          { session }
        );
        expect(imagesUpdateSpy).toHaveBeenCalled();
      });
    });

    describe("_createMilestoneTransactions", () => {
      it("creates correct transactions for multiple milestones", async () => {
        const reward = { total_points_awarded: 10 };
        const newMilestones = [
          { milestone: 5, points_awarded: 10 },
          { milestone: 10, points_awarded: 10 },
        ];
        const spy = jest
          .spyOn(
            rewardsService.rewardTransactionsRepository,
            "createTransaction"
          )
          .mockResolvedValue({});

        await rewardsService._createMilestoneTransactions(
          REWARD_TEST_IMAGE_ID,
          REWARD_TEST_CREATOR_ID,
          reward,
          newMilestones,
          5,
          15,
          {}
        );

        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            milestone: 5,
            previous_total: 10,
            new_total: 20,
            metadata: expect.objectContaining({
              unique_pro_users_count: 15,
            }),
          }),
          expect.any(Object)
        );
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            milestone: 10,
            previous_total: 20,
            new_total: 30,
            metadata: expect.objectContaining({
              unique_pro_users_count: 15,
            }),
          }),
          expect.any(Object)
        );
      });
    });

    describe("_markImageCompleted", () => {
      it("updates image has_pending_reward to false", async () => {
        const spy = jest
          .spyOn(rewardsService.imagesRepository, "update")
          .mockResolvedValue({});
        await rewardsService._markImageCompleted(REWARD_TEST_IMAGE_ID, {});
        expect(spy).toHaveBeenCalledWith(
          REWARD_TEST_IMAGE_ID,
          { has_pending_reward: false },
          { session: {} }
        );
      });
    });
  });

  describe("RewardsService.getUserRewardData", () => {
    it("should return user reward data with correct point totals", async () => {
      jest
        .spyOn(rewardsService.usersRepository, "getById")
        .mockResolvedValue(MOCK_REWARD_USER_WITH_POINTS);
      jest
        .spyOn(rewardsService.rewardsRepository, "findByUserId")
        .mockResolvedValue(MOCK_USER_REWARD_RECORDS);

      const summary = await rewardsService.getUserRewardData(
        MOCK_REWARD_USER_WITH_POINTS._id
      );

      expect(summary).toBeDefined();
      expect(summary.currentPoints).toBe(
        MOCK_REWARD_USER_WITH_POINTS.reward_points_current
      );
      expect(summary.lifetimePoints).toBe(
        MOCK_REWARD_USER_WITH_POINTS.reward_points_lifetime
      );
      expect(summary.totalImages).toBe(MOCK_USER_REWARD_RECORDS.length);
    });
  });

  describe("RewardsService.getRewardsLeaderboard", () => {
    it("should return top creators ordered by total points awarded", async () => {
      jest
        .spyOn(rewardsService.rewardsRepository, "getLeaderboardAggregated")
        .mockResolvedValue(MOCK_AGGREGATED_LEADERBOARD);

      const leaderboard = await rewardsService.getRewardsLeaderboard(3);

      expect(leaderboard.length).toBeLessThanOrEqual(3);
      expect(leaderboard[0].rank).toBe(1);
      if (leaderboard.length > 1) {
        expect(leaderboard[0].totalPointsAwarded).toBeGreaterThanOrEqual(
          leaderboard[1].totalPointsAwarded
        );
      }
    });
  });

  describe("RewardsService.awardBonusPoints", () => {
    it("should throw if imageId is missing", async () => {
      await expect(
        rewardsService.awardBonusPoints(null, MOCK_USERS[0]._id, 50)
      ).rejects.toThrow("Image ID is required");
    });

    it("should throw if image not found", async () => {
      jest
        .spyOn(rewardsService.imagesRepository, "getById")
        .mockResolvedValue(null);

      await expect(
        rewardsService.awardBonusPoints(
          new mongoose.Types.ObjectId(),
          MOCK_USERS[0]._id,
          50
        )
      ).rejects.toThrow("Image not found");
    });

    it("should throw if user not found", async () => {
      jest.spyOn(rewardsService.imagesRepository, "getById").mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        user_id: MOCK_USERS[0]._id,
      });
      jest
        .spyOn(rewardsService.usersRepository, "getById")
        .mockResolvedValue(null);

      await expect(
        rewardsService.awardBonusPoints(
          new mongoose.Types.ObjectId(),
          MOCK_USERS[0]._id,
          50
        )
      ).rejects.toThrow("User not found");
    });

    it("should award bonus points, update rewards doc, user, and create transaction", async () => {
      const imageId = new mongoose.Types.ObjectId();
      const userId = MOCK_REWARD_CREATOR_USER._id;
      const points = 50;
      const reason = "PROMOTION";
      const description = "Bonus award";

      const mockRewardRecord = createMockRewardRecordEmpty();

      jest.spyOn(rewardsService.imagesRepository, "getById").mockResolvedValue({
        _id: imageId,
        user_id: userId,
      });
      jest
        .spyOn(rewardsService.rewardsRepository, "findOrCreateByImageId")
        .mockResolvedValue(mockRewardRecord);
      jest.spyOn(rewardsService.rewardsRepository, "update").mockResolvedValue({
        ...mockRewardRecord,
        total_points_awarded: points,
      });
      jest
        .spyOn(rewardsService.usersRepository, "getById")
        .mockResolvedValue(MOCK_REWARD_CREATOR_USER);
      jest
        .spyOn(rewardsService.usersRepository, "update")
        .mockResolvedValue({});
      const createTransactionSpy = jest
        .spyOn(rewardsService.rewardTransactionsRepository, "createTransaction")
        .mockResolvedValue({
          _id: new mongoose.Types.ObjectId(),
          image_id: imageId,
          user_id: userId,
          transaction_type: "BONUS",
          points_awarded: points,
        });

      const result = await rewardsService.awardBonusPoints(
        imageId,
        userId,
        points,
        reason,
        description
      );

      expect(result.transaction_type).toBe("BONUS");
      expect(result.points_awarded).toBe(points);

      // Verify rewards doc was updated
      expect(rewardsService.rewardsRepository.update).toHaveBeenCalledWith(
        mockRewardRecord._id,
        expect.objectContaining({
          $inc: { total_points_awarded: points },
        })
      );

      // Verify user was updated
      expect(rewardsService.usersRepository.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          reward_points_current: points,
          reward_points_lifetime: points,
        })
      );

      // Verify transaction was created
      expect(createTransactionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction_type: "BONUS",
          points_awarded: points,
        })
      );
    });
  });

  describe("RewardsService.reverseTransaction", () => {
    it("should reverse a reward transaction and update user points", async () => {
      const adminId = new mongoose.Types.ObjectId();
      const transactionId = MOCK_UNREVERSED_TRANSACTION._id;

      jest
        .spyOn(
          rewardsService.rewardTransactionsRepository,
          "getTransactionById"
        )
        .mockResolvedValue(MOCK_UNREVERSED_TRANSACTION);
      jest
        .spyOn(
          rewardsService.rewardTransactionsRepository,
          "reverseTransaction"
        )
        .mockResolvedValue(MOCK_REVERSED_TRANSACTION);
      jest
        .spyOn(rewardsService.usersRepository, "getById")
        .mockResolvedValue(MOCK_REWARD_CREATOR_USER);
      jest
        .spyOn(rewardsService.usersRepository, "update")
        .mockResolvedValue({});
      jest
        .spyOn(rewardsService.rewardTransactionsRepository, "createTransaction")
        .mockResolvedValue({});
      const updateByImageIdSpy = jest
        .spyOn(rewardsService.rewardsRepository, "updateByImageId")
        .mockResolvedValue({});

      const result = await rewardsService.reverseTransaction(
        transactionId,
        adminId,
        "Abuse detected"
      );

      expect(result.is_reversed).toBe(true);
      expect(result.points_awarded).toBeDefined();
      expect(result.points_awarded).toBe(
        MOCK_UNREVERSED_TRANSACTION.points_awarded
      );

      // MILESTONE_REWARD reversal should NOT update rewards doc
      expect(updateByImageIdSpy).not.toHaveBeenCalled();
    });

    it("should also decrement rewards doc when reversing a BONUS transaction", async () => {
      const adminId = new mongoose.Types.ObjectId();
      const imageId = new mongoose.Types.ObjectId();
      const bonusTransaction = {
        ...MOCK_UNREVERSED_TRANSACTION,
        transaction_type: "BONUS",
        image_id: imageId,
        points_awarded: 50,
      };
      const reversedBonusTransaction = {
        ...bonusTransaction,
        is_reversed: true,
        reversed_at: new Date(),
        reversal_reason: "Admin correction",
      };
      const transactionId = bonusTransaction._id;

      jest
        .spyOn(
          rewardsService.rewardTransactionsRepository,
          "getTransactionById"
        )
        .mockResolvedValue(bonusTransaction);
      jest
        .spyOn(
          rewardsService.rewardTransactionsRepository,
          "reverseTransaction"
        )
        .mockResolvedValue(reversedBonusTransaction);
      jest.spyOn(rewardsService.usersRepository, "getById").mockResolvedValue({
        ...MOCK_REWARD_CREATOR_USER,
        reward_points_current: 100,
      });
      jest
        .spyOn(rewardsService.usersRepository, "update")
        .mockResolvedValue({});
      jest
        .spyOn(rewardsService.rewardTransactionsRepository, "createTransaction")
        .mockResolvedValue({});
      const updateByImageIdSpy = jest
        .spyOn(rewardsService.rewardsRepository, "updateByImageId")
        .mockResolvedValue({});

      const result = await rewardsService.reverseTransaction(
        transactionId,
        adminId,
        "Admin correction"
      );

      expect(result.is_reversed).toBe(true);

      // BONUS reversal SHOULD update rewards doc
      expect(updateByImageIdSpy).toHaveBeenCalledWith(
        imageId,
        expect.objectContaining({
          $inc: { total_points_awarded: -50 },
        })
      );
    });
  });
});
