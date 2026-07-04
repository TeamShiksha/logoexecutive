const CreateLogoRequestService = require("../../services/createLogoRequest");
const CreateLogoRequestRepository = require("../../repositories/createLogoRequest");
const {
  ImagesRepository,
  RewardsRepository,
} = require("../../repositories/index.js");
const { StatusTypes } = require("../../utils/constants.js");
const { MOCK_USERS, MOCK_IMAGES } = require("../../utils/mocks.js");
const mongoose = require("mongoose");

jest.mock("../../repositories");
jest.mock("../../repositories/createLogoRequest");

describe("CreateLogoRequestService", () => {
  let createLogoRequestService;
  let mockCreate;
  let mockFindByCompanyUrlAndStatus;
  let mockGetById;
  let mockUpdateLogoStatus;
  let mockGetAll;
  let mockImagesGetById;
  let mockImagesUpdate;
  let mockFetchCloudFrontURL;
  let mockFindOrCreateByImageId;

  beforeEach(() => {
    createLogoRequestService = new CreateLogoRequestService();
    jest.clearAllMocks();

    mockCreate = jest.spyOn(CreateLogoRequestRepository.prototype, "create");
    mockFindByCompanyUrlAndStatus = jest.spyOn(
      CreateLogoRequestRepository.prototype,
      "findByCompanyUrlAndStatus"
    );
    mockGetById = jest.spyOn(CreateLogoRequestRepository.prototype, "getById");
    mockUpdateLogoStatus = jest.spyOn(
      CreateLogoRequestRepository.prototype,
      "updateLogoStatus"
    );
    mockGetAll = jest.spyOn(CreateLogoRequestRepository.prototype, "getAll");
    mockImagesGetById = jest.spyOn(ImagesRepository.prototype, "getById");
    mockImagesUpdate = jest.spyOn(ImagesRepository.prototype, "update");
    mockFetchCloudFrontURL = jest.spyOn(
      ImagesRepository.prototype,
      "fetchCloudFrontURL"
    );
    mockFindOrCreateByImageId = jest.spyOn(
      RewardsRepository.prototype,
      "findOrCreateByImageId"
    );
  });

  const userId = MOCK_USERS[0]._id;
  const companyUrl = "https://testcompany.com/";
  const imageId = MOCK_IMAGES[0]._id;
  const createLogoId = new mongoose.Types.ObjectId();

  describe("addLogoData", () => {
    it("should create a new logo request and return its ID", async () => {
      const mockResult = { _id: createLogoId };
      mockCreate.mockResolvedValue(mockResult);

      const result = await createLogoRequestService.addLogoData(
        userId,
        companyUrl,
        imageId
      );

      expect(mockCreate).toHaveBeenCalledWith({
        user_id: userId,
        companyUrl: companyUrl,
        images: imageId,
      });
      expect(result).toEqual({ _id: createLogoId });
    });

    it("should throw an error if creation fails", async () => {
      mockCreate.mockRejectedValue(new Error("Creation failed"));

      await expect(
        createLogoRequestService.addLogoData(userId, companyUrl, imageId)
      ).rejects.toThrow("Creation failed");
    });
  });

  describe("findPendingRequestByCompanyUrl", () => {
    it("should return null if no pending logo exists for company URL", async () => {
      mockFindByCompanyUrlAndStatus.mockResolvedValue(null);

      const result =
        await createLogoRequestService.findPendingRequestByCompanyUrl(
          companyUrl
        );

      expect(mockFindByCompanyUrlAndStatus).toHaveBeenCalledWith(
        companyUrl,
        StatusTypes.PENDING
      );
      expect(result).toBeNull();
    });

    it("should return the logo request if a pending one exists", async () => {
      const mockRequest = { companyUrl, status: StatusTypes.PENDING };
      mockFindByCompanyUrlAndStatus.mockResolvedValue(mockRequest);

      const result =
        await createLogoRequestService.findPendingRequestByCompanyUrl(
          companyUrl
        );

      expect(result).toEqual(mockRequest);
    });
  });

  describe("respondToLogo", () => {
    it("should return alreadyProcessed: true if logo is already RESOLVED", async () => {
      mockGetById.mockResolvedValue({
        _id: createLogoId,
        status: "RESOLVED",
        images: imageId,
      });

      const result = await createLogoRequestService.respondToLogo(
        createLogoId,
        userId,
        "RESOLVED",
        "comment"
      );

      expect(result).toEqual({ alreadyProcessed: true });
    });

    it("should return alreadyProcessed: true if logo is already REJECTED", async () => {
      mockGetById.mockResolvedValue({
        _id: createLogoId,
        status: "REJECTED",
        images: imageId,
      });

      const result = await createLogoRequestService.respondToLogo(
        createLogoId,
        userId,
        "REJECTED",
        "comment"
      );

      expect(result).toEqual({ alreadyProcessed: true });
    });

    it("should update logo status and publish image if RESOLVED", async () => {
      mockGetById.mockResolvedValue({
        _id: createLogoId,
        status: "PENDING",
        images: imageId,
        user_id: userId,
      });
      mockUpdateLogoStatus.mockResolvedValue({ modifiedCount: 1 });
      mockImagesUpdate.mockResolvedValue({});
      mockFindOrCreateByImageId.mockResolvedValue({
        image_id: imageId,
        user_id: userId,
        unique_pro_users: [],
      });

      const result = await createLogoRequestService.respondToLogo(
        createLogoId,
        userId,
        StatusTypes.RESOLVED,
        "Approved"
      );

      expect(mockUpdateLogoStatus).toHaveBeenCalledWith(
        createLogoId,
        expect.objectContaining({
          status: StatusTypes.RESOLVED,
          comment: "Approved",
          operator: userId,
        })
      );
      expect(mockImagesUpdate).toHaveBeenCalledWith(
        imageId,
        expect.objectContaining({ is_published: true })
      );
      expect(mockFindOrCreateByImageId).toHaveBeenCalledWith(imageId, userId);
      expect(result).toEqual({ modifiedCount: 1 });
    });

    it("should update logo status and mark image deleted if REJECTED", async () => {
      mockGetById.mockResolvedValue({
        _id: createLogoId,
        status: "PENDING",
        images: imageId,
        user_id: userId,
      });
      mockUpdateLogoStatus.mockResolvedValue({ modifiedCount: 1 });
      mockImagesUpdate.mockResolvedValue({});

      const result = await createLogoRequestService.respondToLogo(
        createLogoId,
        userId,
        StatusTypes.REJECTED,
        "Rejected"
      );

      expect(mockImagesUpdate).toHaveBeenCalledWith(
        imageId,
        expect.objectContaining({ is_deleted: true })
      );
      expect(mockFindOrCreateByImageId).not.toHaveBeenCalled();
      expect(result).toEqual({ modifiedCount: 1 });
    });

    it("should throw error if MongoDB update fails", async () => {
      mockGetById.mockResolvedValue({
        _id: createLogoId,
        status: "PENDING",
        images: imageId,
      });
      mockUpdateLogoStatus.mockResolvedValue({ modifiedCount: 0 });

      await expect(
        createLogoRequestService.respondToLogo(
          createLogoId,
          userId,
          StatusTypes.RESOLVED,
          "Approved"
        )
      ).rejects.toThrow("MongoDB operation failed");
    });

    it("should not create reward if logo has no associated image on RESOLVED", async () => {
      mockGetById.mockResolvedValue({
        _id: createLogoId,
        status: "PENDING",
        images: null,
        user_id: userId,
      });
      mockUpdateLogoStatus.mockResolvedValue({ modifiedCount: 1 });

      const result = await createLogoRequestService.respondToLogo(
        createLogoId,
        userId,
        StatusTypes.RESOLVED,
        "Approved"
      );

      expect(mockImagesUpdate).not.toHaveBeenCalled();
      expect(mockFindOrCreateByImageId).not.toHaveBeenCalled();
      expect(result).toEqual({ modifiedCount: 1 });
    });

    it("should propagate error if reward creation fails on RESOLVED", async () => {
      mockGetById.mockResolvedValue({
        _id: createLogoId,
        status: "PENDING",
        images: imageId,
        user_id: userId,
      });
      mockUpdateLogoStatus.mockResolvedValue({ modifiedCount: 1 });
      mockImagesUpdate.mockResolvedValue({});
      mockFindOrCreateByImageId.mockRejectedValue(
        new Error("Reward creation failed")
      );

      await expect(
        createLogoRequestService.respondToLogo(
          createLogoId,
          userId,
          StatusTypes.RESOLVED,
          "Approved"
        )
      ).rejects.toThrow("Reward creation failed");
    });
  });

  describe("getLogoDetails", () => {
    it("should return null if logo not found", async () => {
      mockGetById.mockResolvedValue(null);

      const result =
        await createLogoRequestService.getLogoDetails(createLogoId);

      expect(result).toBeNull();
    });

    it("should return logo details with previewUrl", async () => {
      const mockLogo = {
        _id: createLogoId,
        companyUrl: companyUrl,
        status: "PENDING",
        comment: null,
        openedAt: new Date(),
        closedAt: null,
        images: imageId,
      };
      const mockImage = {
        extension: "png",
        company_name: "TESTCOMPANY",
      };

      mockGetById.mockResolvedValue(mockLogo);
      mockImagesGetById.mockResolvedValue(mockImage);
      mockFetchCloudFrontURL.mockResolvedValue(
        "https://cloudfront.example.com/png/TESTCOMPANY.png"
      );

      const result =
        await createLogoRequestService.getLogoDetails(createLogoId);

      expect(result).toMatchObject({
        _id: createLogoId,
        previewUrl: "https://cloudfront.example.com/png/TESTCOMPANY.png",
      });
    });

    it("should return null previewUrl if no images associated", async () => {
      const mockLogo = {
        _id: createLogoId,
        companyUrl: companyUrl,
        status: "PENDING",
        comment: null,
        openedAt: new Date(),
        closedAt: null,
        images: null,
      };

      mockGetById.mockResolvedValue(mockLogo);

      const result =
        await createLogoRequestService.getLogoDetails(createLogoId);

      expect(result.previewUrl).toBeNull();
    });
  });

  describe("getPaginatedCreateLogos", () => {
    it("should return paginated results", async () => {
      const mockResult = {
        data: [{ _id: createLogoId, companyUrl }],
        total: 1,
        currentPage: 1,
        totalPages: 1,
      };
      mockGetAll.mockResolvedValue(mockResult);

      const result = await createLogoRequestService.getPaginatedCreateLogos(
        1,
        10,
        "active"
      );

      expect(mockGetAll).toHaveBeenCalledWith(1, 10, "active");
      expect(result).toEqual(mockResult);
    });

    it("should return null if no logos exist", async () => {
      mockGetAll.mockResolvedValue(null);

      const result = await createLogoRequestService.getPaginatedCreateLogos(
        1,
        10,
        "active"
      );

      expect(result).toBeNull();
    });
  });

  describe("getLogoById", () => {
    it("should return the logo by ID", async () => {
      const mockLogo = { _id: createLogoId, companyUrl };
      mockGetById.mockResolvedValue(mockLogo);

      const result = await createLogoRequestService.getLogoById(createLogoId);

      expect(mockGetById).toHaveBeenCalledWith(createLogoId);
      expect(result).toEqual(mockLogo);
    });

    it("should return null if logo not found", async () => {
      mockGetById.mockResolvedValue(null);

      const result = await createLogoRequestService.getLogoById(createLogoId);

      expect(result).toBeNull();
    });
  });
});
