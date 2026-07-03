const mongoose = require("mongoose");
const RewardTrackingService = require("../../services/rewardTransactions");
const { SubscriptionTypes } = require("../../utils/constants");
const {
  MOCK_LOG_ENTRY_HOBBY,
  MOCK_LOG_ENTRY_VALID,
} = require("../../utils/mocks");

const createMockLogoRequestLogEntry = () => ({
  _id: new mongoose.Types.ObjectId(),
  user_id: "user123",
  key_id: "key123",
  image_id: "image123",
  user_agent: "Mozilla/5.0",
  response_size_bytes: 1024,
  user_plan: SubscriptionTypes.PRO,
  is_reward_eligible: true,
  reward_eligibility_reason: "VALID",
  createdAt: new Date(),
});

const createValidRewardTrackingParams = () => ({
  imageId: "image123",
  userId: "user123",
  creatorId: "creator456",
  keyId: "key123",
  subscriptionId: "sub123",
  subscription: { type: SubscriptionTypes.PRO },
  userAgent: "Mozilla/5.0",
  response_size_bytes: 1024,
});

const createMockIntegrationValidProScenario = () => {
  const userId = new mongoose.Types.ObjectId();
  const creatorId = new mongoose.Types.ObjectId();
  const params = {
    imageId: "logo-apple",
    userId,
    creatorId,
    keyId: "key-123",
    subscriptionId: "sub-pro-001",
    subscription: { type: SubscriptionTypes.PRO },
  };
  return {
    params,
    mockLogEntry: {
      _id: new mongoose.Types.ObjectId(),
      user_id: userId,
      key_id: params.keyId,
      image_id: params.imageId,
      user_plan: SubscriptionTypes.PRO,
      is_reward_eligible: true,
      reward_eligibility_reason: "VALID",
    },
  };
};

const createMockIntegrationSelfUsageScenario = () => ({
  params: {
    imageId: "logo-apple",
    userId: "user123",
    creatorId: "user123",
    keyId: "key-123",
    subscriptionId: "sub-pro-001",
    subscription: { type: SubscriptionTypes.PRO },
  },
  mockLogEntry: {
    _id: new mongoose.Types.ObjectId(),
    is_reward_eligible: false,
    reward_eligibility_reason: "SELF_USAGE",
  },
});

const createMockIntegrationObjectIdScenario = () => {
  const userId = new mongoose.Types.ObjectId();
  const creatorId = new mongoose.Types.ObjectId();
  const params = {
    imageId: "apple-logo-2024",
    userId,
    creatorId,
    keyId: "api-key-abc123",
    subscriptionId: "sub-pro-xyz",
    subscription: { type: SubscriptionTypes.PRO },
  };
  return {
    params,
    mockLogEntry: {
      _id: new mongoose.Types.ObjectId(),
      user_id: userId,
      key_id: params.keyId,
      image_id: params.imageId,
      user_plan: SubscriptionTypes.PRO,
      is_reward_eligible: true,
      reward_eligibility_reason: "VALID",
    },
  };
};

jest.mock("../../repositories");

describe("RewardTrackingService", () => {
  let rewardTrackingService;
  let mockLogoRequestLogsRepository;
  let mockImagesRepository;

  beforeEach(() => {
    jest.clearAllMocks();

    rewardTrackingService = new RewardTrackingService();

    mockLogoRequestLogsRepository =
      rewardTrackingService.logoRequestLogsRepository;
    mockImagesRepository = rewardTrackingService.imagesRepository;

    mockLogoRequestLogsRepository.create = jest.fn();
    mockLogoRequestLogsRepository.find = jest.fn();
    mockImagesRepository.update = jest.fn().mockResolvedValue({});
  });

  describe("Constructor", () => {
    it("should initialize with required repositories", () => {
      expect(rewardTrackingService.logoRequestLogsRepository).toBeDefined();
      expect(rewardTrackingService.subscriptionsRepository).toBeDefined();
      expect(rewardTrackingService.usersRepository).toBeDefined();
      expect(rewardTrackingService.imagesRepository).toBeDefined();
    });

    it("should create separate repository instances", () => {
      const service1 = new RewardTrackingService();
      const service2 = new RewardTrackingService();

      expect(service1.logoRequestLogsRepository).not.toBe(
        service2.logoRequestLogsRepository
      );
    });
  });

  describe("validateRequestParams", () => {
    it("should validate all required parameters", () => {
      const params = {
        imageId: "image123",
        userId: "user123",
        creatorId: "creator123",
        subscriptionId: "sub123",
        subscription: { type: SubscriptionTypes.PRO },
      };

      const result = rewardTrackingService.validateRequestParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should report error when imageId is missing", () => {
      const params = {
        userId: "user123",
        creatorId: "creator123",
        subscriptionId: "sub123",
        subscription: { type: SubscriptionTypes.PRO },
      };

      const result = rewardTrackingService.validateRequestParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("imageId is required");
    });

    it("should report error when userId is missing", () => {
      const params = {
        imageId: "image123",
        creatorId: "creator123",
        subscriptionId: "sub123",
        subscription: { type: SubscriptionTypes.PRO },
      };

      const result = rewardTrackingService.validateRequestParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("userId is required");
    });

    it("should report error when creatorId is missing", () => {
      const params = {
        imageId: "image123",
        userId: "user123",
        subscriptionId: "sub123",
        subscription: { type: SubscriptionTypes.PRO },
      };

      const result = rewardTrackingService.validateRequestParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("creatorId is required");
    });

    it("should report error when subscriptionId is missing", () => {
      const params = {
        imageId: "image123",
        userId: "user123",
        creatorId: "creator123",
        subscription: { type: SubscriptionTypes.PRO },
      };

      const result = rewardTrackingService.validateRequestParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("subscriptionId is required");
    });

    it("should report error when subscription object is missing", () => {
      const params = {
        imageId: "image123",
        userId: "user123",
        creatorId: "creator123",
        subscriptionId: "sub123",
      };

      const result = rewardTrackingService.validateRequestParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("subscription object is required");
    });

    it("should report multiple errors when multiple parameters are missing", () => {
      const params = {
        imageId: "image123",
      };

      const result = rewardTrackingService.validateRequestParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it("should validate with empty string values", () => {
      const params = {
        imageId: "",
        userId: "",
        creatorId: "",
        subscriptionId: "",
        subscription: { type: SubscriptionTypes.PRO },
      };

      const result = rewardTrackingService.validateRequestParams(params);

      expect(result.isValid).toBe(false);
    });

    it("should validate with null values", () => {
      const params = {
        imageId: null,
        userId: null,
        creatorId: null,
        subscriptionId: null,
        subscription: null,
      };

      const result = rewardTrackingService.validateRequestParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(5);
    });

    it("should validate with undefined values", () => {
      const params = {
        imageId: undefined,
        userId: undefined,
        creatorId: undefined,
        subscriptionId: undefined,
        subscription: undefined,
      };

      const result = rewardTrackingService.validateRequestParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(5);
    });
  });

  describe("validateAndLogRequest", () => {
    const createMockLogEntry = createMockLogoRequestLogEntry;
    const createValidParams = createValidRewardTrackingParams;

    describe("Subscription Type Validation", () => {
      it("should reject non-PRO users (HOBBY_USER)", async () => {
        const params = createValidParams();
        params.subscription = { type: SubscriptionTypes.HOBBY };
        const mockLogEntry = createMockLogEntry();
        mockLogEntry.is_reward_eligible = false;
        mockLogEntry.reward_eligibility_reason = "HOBBY_USER";

        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const result =
          await rewardTrackingService.validateAndLogRequest(params);

        expect(result.is_reward_eligible).toBe(false);
        expect(result.reward_eligibility_reason).toBe("HOBBY_USER");
        expect(mockLogoRequestLogsRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            response_size_bytes: params.response_size_bytes,
            user_plan: SubscriptionTypes.HOBBY,
            is_reward_eligible: false,
            reward_eligibility_reason: "HOBBY_USER",
          })
        );
      });

      it("should accept PRO subscription", async () => {
        const params = createValidParams();
        params.subscription = { type: SubscriptionTypes.PRO };
        const mockLogEntry = createMockLogEntry();

        mockLogoRequestLogsRepository.find.mockResolvedValue([]);
        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const result =
          await rewardTrackingService.validateAndLogRequest(params);

        expect(result.is_reward_eligible).toBe(true);
      });
    });

    describe("Self-Usage Detection", () => {
      it("should reject when user is the creator (SELF_USAGE)", async () => {
        const params = createValidParams();
        params.userId = "same-user";
        params.creatorId = "same-user";
        const mockLogEntry = createMockLogEntry();
        mockLogEntry.is_reward_eligible = false;
        mockLogEntry.reward_eligibility_reason = "SELF_USAGE";

        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const result =
          await rewardTrackingService.validateAndLogRequest(params);

        expect(result.is_reward_eligible).toBe(false);
        expect(result.reward_eligibility_reason).toBe("SELF_USAGE");
      });

      it("should handle string IDs correctly for self-usage check", async () => {
        const params = createValidParams();
        params.userId = "123";
        params.creatorId = "123";
        const mockLogEntry = createMockLogEntry();
        mockLogEntry.is_reward_eligible = false;
        mockLogEntry.reward_eligibility_reason = "SELF_USAGE";

        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const result =
          await rewardTrackingService.validateAndLogRequest(params);

        expect(result.reward_eligibility_reason).toBe("SELF_USAGE");
      });

      it("should handle ObjectId type comparison correctly", async () => {
        const params = createValidParams();
        const userId = new mongoose.Types.ObjectId();
        params.userId = userId;
        params.creatorId = userId;
        const mockLogEntry = createMockLogEntry();
        mockLogEntry.is_reward_eligible = false;
        mockLogEntry.reward_eligibility_reason = "SELF_USAGE";

        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const result =
          await rewardTrackingService.validateAndLogRequest(params);

        expect(result.reward_eligibility_reason).toBe("SELF_USAGE");
      });

      it("should not reject when user and creator are different", async () => {
        const params = createValidParams();
        const mockLogEntry = createMockLogEntry();

        mockLogoRequestLogsRepository.find.mockResolvedValue([]);
        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        await rewardTrackingService.validateAndLogRequest(params);

        expect(mockLogoRequestLogsRepository.find).toHaveBeenCalled();
      });
    });

    describe("Duplicate Usage Detection", () => {
      it("should reject duplicate usage (DUPLICATE_USAGE)", async () => {
        const params = createValidParams();
        const existingLog = createMockLogEntry();
        const mockLogEntry = createMockLogEntry();
        mockLogEntry.is_reward_eligible = false;
        mockLogEntry.reward_eligibility_reason = "DUPLICATE_USAGE";

        mockLogoRequestLogsRepository.find.mockResolvedValue([existingLog]);
        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const result =
          await rewardTrackingService.validateAndLogRequest(params);

        expect(result.is_reward_eligible).toBe(false);
        expect(result.reward_eligibility_reason).toBe("DUPLICATE_USAGE");
        expect(mockLogoRequestLogsRepository.find).toHaveBeenCalledWith({
          image_id: params.imageId,
          user_id: params.userId,
          is_reward_eligible: true,
        });
      });

      it("should handle empty find results as no duplicates", async () => {
        const params = createValidParams();
        const mockLogEntry = createMockLogEntry();

        mockLogoRequestLogsRepository.find.mockResolvedValue(null);
        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const result =
          await rewardTrackingService.validateAndLogRequest(params);

        expect(result.is_reward_eligible).toBe(true);
        expect(result.reward_eligibility_reason).toBe("VALID");
      });

      it("should handle array with multiple duplicate records", async () => {
        const params = createValidParams();
        const existingLog1 = createMockLogEntry();
        const existingLog2 = createMockLogEntry();
        const mockLogEntry = createMockLogEntry();
        mockLogEntry.is_reward_eligible = false;
        mockLogEntry.reward_eligibility_reason = "DUPLICATE_USAGE";

        mockLogoRequestLogsRepository.find.mockResolvedValue([
          existingLog1,
          existingLog2,
        ]);
        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const result =
          await rewardTrackingService.validateAndLogRequest(params);

        expect(result.is_reward_eligible).toBe(false);
        expect(result.reward_eligibility_reason).toBe("DUPLICATE_USAGE");
      });
    });

    describe("Valid Request Handling", () => {
      it("should approve valid requests (VALID)", async () => {
        const params = createValidParams();
        const mockLogEntry = createMockLogEntry();
        mockLogEntry.is_reward_eligible = true;
        mockLogEntry.reward_eligibility_reason = "VALID";

        mockLogoRequestLogsRepository.find.mockResolvedValue([]);
        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const result =
          await rewardTrackingService.validateAndLogRequest(params);

        expect(result.is_reward_eligible).toBe(true);
        expect(result.reward_eligibility_reason).toBe("VALID");
        expect(mockLogoRequestLogsRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: params.userId,
            key_id: params.keyId,
            image_id: params.imageId,
            response_size_bytes: params.response_size_bytes,
            user_plan: SubscriptionTypes.PRO,
            is_reward_eligible: true,
            reward_eligibility_reason: "VALID",
          })
        );
      });

      it("should return log entry with all required fields", async () => {
        const params = createValidParams();
        const mockLogEntry = createMockLogEntry();

        mockLogoRequestLogsRepository.find.mockResolvedValue([]);
        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const result =
          await rewardTrackingService.validateAndLogRequest(params);

        expect(result).toHaveProperty("_id");
        expect(result).toHaveProperty("user_id");
        expect(result).toHaveProperty("image_id");
        expect(result).toHaveProperty("key_id");
        expect(result).toHaveProperty("response_size_bytes");
        expect(result).toHaveProperty("user_plan");
        expect(result).toHaveProperty("is_reward_eligible");
        expect(result).toHaveProperty("reward_eligibility_reason");
      });

      it("should call create with correctly formatted data", async () => {
        const params = createValidParams();
        const mockLogEntry = createMockLogEntry();

        mockLogoRequestLogsRepository.find.mockResolvedValue([]);
        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        await rewardTrackingService.validateAndLogRequest(params);

        expect(mockLogoRequestLogsRepository.create).toHaveBeenCalledWith({
          user_id: params.userId,
          key_id: params.keyId,
          image_id: params.imageId,
          response_size_bytes: params.response_size_bytes,
          user_plan: SubscriptionTypes.PRO,
          is_reward_eligible: true,
          reward_eligibility_reason: "VALID",
        });
      });
    });

    describe("Async Reward Processing", () => {
      it("should trigger async reward processing for valid requests", async () => {
        const params = createValidParams();
        const mockLogEntry = createMockLogEntry();

        mockLogoRequestLogsRepository.find.mockResolvedValue([]);
        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        jest.spyOn(rewardTrackingService, "triggerAsyncRewardProcessing");

        await rewardTrackingService.validateAndLogRequest(params);

        expect(
          rewardTrackingService.triggerAsyncRewardProcessing
        ).toHaveBeenCalledWith(params.imageId);
      });

      it("should not trigger async reward processing for invalid requests", async () => {
        const params = createValidParams();
        params.subscription = { type: SubscriptionTypes.HOBBY };
        const mockLogEntry = createMockLogEntry();
        mockLogEntry.is_reward_eligible = false;
        mockLogEntry.reward_eligibility_reason = "HOBBY_USER";

        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        jest.spyOn(rewardTrackingService, "triggerAsyncRewardProcessing");

        await rewardTrackingService.validateAndLogRequest(params);

        expect(
          rewardTrackingService.triggerAsyncRewardProcessing
        ).not.toHaveBeenCalled();
      });

      it("should trigger async reward processing only once per valid request", async () => {
        const params = createValidParams();
        const mockLogEntry = createMockLogEntry();

        mockLogoRequestLogsRepository.find.mockResolvedValue([]);
        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const triggerSpy = jest.spyOn(
          rewardTrackingService,
          "triggerAsyncRewardProcessing"
        );

        await rewardTrackingService.validateAndLogRequest(params);

        expect(triggerSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe("Error Handling", () => {
      it("should handle repository create errors gracefully", async () => {
        const params = createValidParams();
        const error = new Error("Database error");

        mockLogoRequestLogsRepository.find.mockResolvedValue([]);
        mockLogoRequestLogsRepository.create.mockRejectedValue(error);

        await expect(
          rewardTrackingService.validateAndLogRequest(params)
        ).rejects.toThrow("Database error");
      });

      it("should handle repository find errors gracefully", async () => {
        const params = createValidParams();
        const error = new Error("Query error");

        mockLogoRequestLogsRepository.find.mockRejectedValue(error);

        await expect(
          rewardTrackingService.validateAndLogRequest(params)
        ).rejects.toThrow("Query error");
      });

      it("should propagate unexpected errors from repository", async () => {
        const params = createValidParams();
        const error = new Error("Unexpected error");

        mockLogoRequestLogsRepository.find.mockResolvedValue([]);
        mockLogoRequestLogsRepository.create.mockRejectedValue(error);

        await expect(
          rewardTrackingService.validateAndLogRequest(params)
        ).rejects.toThrow("Unexpected error");
      });
    });

    describe("Validation Order", () => {
      it("should check subscription type before self-usage", async () => {
        const params = createValidParams();
        params.userId = "same-user";
        params.creatorId = "same-user";
        params.subscription = { type: SubscriptionTypes.HOBBY };
        const mockLogEntry = createMockLogEntry();
        mockLogEntry.is_reward_eligible = false;
        mockLogEntry.reward_eligibility_reason = "HOBBY_USER";

        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const result =
          await rewardTrackingService.validateAndLogRequest(params);

        expect(result.reward_eligibility_reason).toBe("HOBBY_USER");
        expect(mockLogoRequestLogsRepository.find).not.toHaveBeenCalled();
      });

      it("should check self-usage before duplicate usage", async () => {
        const params = createValidParams();
        params.userId = "same-user";
        params.creatorId = "same-user";
        const mockLogEntry = createMockLogEntry();
        mockLogEntry.is_reward_eligible = false;
        mockLogEntry.reward_eligibility_reason = "SELF_USAGE";

        mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

        const result =
          await rewardTrackingService.validateAndLogRequest(params);

        expect(result.reward_eligibility_reason).toBe("SELF_USAGE");
        expect(mockLogoRequestLogsRepository.find).not.toHaveBeenCalled();
      });
    });
  });

  describe("triggerAsyncRewardProcessing", () => {
    it("should set has_pending_reward = true on the image", async () => {
      const imageId = new mongoose.Types.ObjectId();

      await rewardTrackingService.triggerAsyncRewardProcessing(imageId);

      expect(mockImagesRepository.update).toHaveBeenCalledWith(imageId, {
        has_pending_reward: true,
      });
    });

    it("should call update once per invocation", async () => {
      const imageId = new mongoose.Types.ObjectId();

      await rewardTrackingService.triggerAsyncRewardProcessing(imageId);

      expect(mockImagesRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should pass the exact imageId to update for different ID formats", async () => {
      const stringId = "image123";
      await rewardTrackingService.triggerAsyncRewardProcessing(stringId);

      expect(mockImagesRepository.update).toHaveBeenCalledWith(stringId, {
        has_pending_reward: true,
      });
    });

    it("should propagate repository errors", async () => {
      const imageId = new mongoose.Types.ObjectId();
      mockImagesRepository.update.mockRejectedValue(new Error("DB error"));

      await expect(
        rewardTrackingService.triggerAsyncRewardProcessing(imageId)
      ).rejects.toThrow("DB error");
    });
  });

  describe("Integration scenarios", () => {
    it("should handle full flow for valid PRO user", async () => {
      const { params, mockLogEntry } = createMockIntegrationValidProScenario();

      mockLogoRequestLogsRepository.find.mockResolvedValue([]);
      mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

      const result = await rewardTrackingService.validateAndLogRequest(params);

      expect(result.is_reward_eligible).toBe(true);
      expect(result.reward_eligibility_reason).toBe("VALID");
      expect(mockLogoRequestLogsRepository.create).toHaveBeenCalled();
      expect(mockImagesRepository.update).toHaveBeenCalledWith(params.imageId, {
        has_pending_reward: true,
      });
    });

    it("should stop processing after first validation failure", async () => {
      const { params, mockLogEntry } = createMockIntegrationSelfUsageScenario();

      mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

      const result = await rewardTrackingService.validateAndLogRequest(params);

      expect(result.reward_eligibility_reason).toBe("SELF_USAGE");
      expect(mockLogoRequestLogsRepository.find).not.toHaveBeenCalled();
    });

    it("should handle complex ObjectId comparisons in real-world scenario", async () => {
      const { params, mockLogEntry } = createMockIntegrationObjectIdScenario();

      mockLogoRequestLogsRepository.find.mockResolvedValue([]);
      mockLogoRequestLogsRepository.create.mockResolvedValue(mockLogEntry);

      const result = await rewardTrackingService.validateAndLogRequest(params);

      expect(result.is_reward_eligible).toBe(true);
    });

    it("should mark HOBBY users as non-eligible", async () => {
      const params = {
        ...createValidRewardTrackingParams(),
        subscription: { type: SubscriptionTypes.HOBBY },
      };

      mockLogoRequestLogsRepository.create.mockResolvedValue(
        MOCK_LOG_ENTRY_HOBBY
      );

      const result = await rewardTrackingService.validateAndLogRequest(params);

      expect(result.is_reward_eligible).toBe(false);
      expect(result.reward_eligibility_reason).toBe("HOBBY_USER");
    });

    it("should mark PRO users as eligible", async () => {
      const params = createValidRewardTrackingParams();

      mockLogoRequestLogsRepository.find.mockResolvedValue([]);
      mockLogoRequestLogsRepository.create.mockResolvedValue(
        MOCK_LOG_ENTRY_VALID
      );

      const result = await rewardTrackingService.validateAndLogRequest(params);

      expect(result.is_reward_eligible).toBe(true);
      expect(result.reward_eligibility_reason).toBe("VALID");
    });
  });
});
