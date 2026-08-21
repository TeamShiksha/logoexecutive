const Image = require("../../models/images");
const User = require("../../models/users");
const { ImagesRepository } = require("../../repositories");
const ImageServices = require("../../services/images");
const { MOCK_IMAGES, MOCK_USERS } = require("../../utils/mocks");

describe("Image Service", () => {
  let imageService;
  beforeEach(() => {
    imageService = new ImageServices();
    jest.clearAllMocks();
  });

  it("should return null if no image found when checkDB is true", async () => {
    jest
      .spyOn(ImagesRepository.prototype, "fetchImage")
      .mockResolvedValue(null);
    const result = await imageService.fetchImageByCompanyFree({
      company_name: "Test Company",
    });

    expect(result).toBeNull();
  });

  it("should return presigned URL & S3 key", async () => {
    const imageName = MOCK_IMAGES[0].company_name.split(".")[0];
    const extension = MOCK_IMAGES[0].company_name.split(".")[1];

    jest.spyOn(imageService, "getPreSignedUrl").mockResolvedValue({
      presignedUrl: "mockPresignedUrl",
      key: `mockBucketKey/${extension}/${imageName}.${extension}`,
    });

    const result = await imageService.getPreSignedUrl(imageName, extension);

    expect(result).toEqual({
      presignedUrl: "mockPresignedUrl",
      key: `mockBucketKey/${extension}/${imageName}.${extension}`,
    });
  });

  it("should return cloudfront URL using domain from DB", async () => {
    const image = new Image(MOCK_IMAGES[0]);
    jest
      .spyOn(ImagesRepository.prototype, "fetchImage")
      .mockResolvedValue(image);
    jest
      .spyOn(ImagesRepository.prototype, "fetchCloudFrontURL")
      .mockResolvedValue("cloudfront-url");

    const result = await imageService.fetchImageByCompanyFree({
      company: "test company",
    });

    expect(result).toBe("cloudfront-url");
  });

  it("should return list of companies", async () => {
    jest
      .spyOn(ImagesRepository.prototype, "fetchCompanyList")
      .mockResolvedValue(MOCK_IMAGES);
    const result = await imageService.fetchCompanyList("regex-pattern");
    expect(result).toEqual(MOCK_IMAGES);
    expect(ImagesRepository.prototype.fetchCompanyList).toHaveBeenCalledWith(
      "regex-pattern"
    );
  });

  it("should update image and return id and updatedAt", async () => {
    const user = new User(MOCK_USERS[0]);
    const updatedObj = {
      uploadedBy: user.id,
      imageSize: 100,
      Extension: "png",
      updatedAt: "2025-08-12",
    };
    jest.spyOn(ImagesRepository.prototype, "update").mockResolvedValue({
      _id: user.id,
      updatedAt: "2025-08-12",
    });

    const result = await imageService.updateImageById(user.id, updatedObj);

    expect(result).toEqual({ _id: user.id, updatedAt: "2025-08-12" });
  });

  it("should return list of company data with signed URLs", async () => {
    jest
      .spyOn(imageService, "fetchImageByCompanyFree")
      .mockResolvedValue("signed-url");

    const mockCompanies = [
      {
        company_name: MOCK_IMAGES[0].company_name,
        extension: MOCK_IMAGES[0].extension,
      },
      {
        company_name: MOCK_IMAGES[1].company_name,
        extension: MOCK_IMAGES[1].extension,
      },
    ];
    const result = await imageService.getDataList(mockCompanies);

    expect(result).toEqual([
      {
        companyName: "GOOGLE",
        image: "signed-url",
        extension: MOCK_IMAGES[0].extension,
      },
      {
        companyName: "MICROSOFT",
        image: "signed-url",
        extension: MOCK_IMAGES[1].extension,
      },
    ]);
  });

  it("should skip companies with no signed URL", async () => {
    jest.spyOn(imageService, "fetchImageByCompanyFree").mockResolvedValue(null);

    const mockCompanies = [{ company_name: "Comp1" }];
    const result = await imageService.getDataList(mockCompanies);

    expect(result).toEqual([]);
  });

  it("should create image record and return id & updatedAt", async () => {
    const user = new User(MOCK_USERS[0]);
    const imgData = {
      user_id: user.id,
      company_name: "DRX",
      company_uri: "https://example.com/drx",
      image_size: "100",
      extension: "png",
    };

    jest.spyOn(ImagesRepository.prototype, "create").mockResolvedValue({
      _id: user.id,
      updated_at: "2025-08-12",
    });

    const result = await imageService.createImageData(
      imgData.user_id,
      imgData.image_size,
      imgData.company_name,
      imgData.company_uri,
      imgData.extension
    );
    expect(result).toEqual({ _id: user.id, updatedAt: "2025-08-12" });
  });

  it("should return images for given user", async () => {
    const mockResponse = {
      data: MOCK_IMAGES.map((img) => (img.data ? img.data() : img)),
      total: MOCK_IMAGES.length,
      currentPage: 1,
      totalPages: 1,
    };

    jest
      .spyOn(ImagesRepository.prototype, "getAllImages")
      .mockResolvedValue(mockResponse);

    const result = await imageService.getImages(0, 10);

    expect(result).toEqual(mockResponse);
    expect(ImagesRepository.prototype.getAllImages).toHaveBeenCalledWith(
      0,
      10,
      ""
    );
  });

  it("should return image by id", async () => {
    const image = new Image(MOCK_IMAGES[2]);
    jest.spyOn(ImagesRepository.prototype, "getById").mockResolvedValue(image);

    const result = await imageService.getImageById(image._id);
    expect(result).toBe(image);
    expect(result.company_name).toBe("AMAZON.png");
  });

  it("should return image by company name", async () => {
    const image = new Image(MOCK_IMAGES[0]);
    jest
      .spyOn(ImagesRepository.prototype, "fetchImage")
      .mockResolvedValue(image);

    const result = await imageService.getImageByCompanyName(image.company_name);
    expect(result).toBe(image);
    expect(result.company_name).toBe(image.company_name);
  });
});
