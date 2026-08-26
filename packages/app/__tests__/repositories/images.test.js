jest.mock("../../utils/cloudFront", () => ({
  cloudFrontSignedURL: jest.fn(),
  cloudFrontInvalidate: jest.fn(),
}));

const {
  cloudFrontSignedURL,
  cloudFrontInvalidate,
} = require("../../utils/cloudFront");
const { ImagesRepository } = require("../../repositories");
const Image = require("../../models/images");

const createQueryMock = (result) => {
  const query = {
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  query.skip = jest.fn().mockReturnValue(query);
  query.limit = jest.fn().mockReturnValue(query);
  query.sort = jest.fn().mockReturnValue(query);
  return query;
};

const createImageDoc = (companyName, extension) => ({
  company_name: companyName,
  extension,
  data: () => ({ company_name: companyName, extension }),
});

describe("ImagesRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new ImagesRepository();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("fetchImage", () => {
    it("matches the company name exactly or with an extension suffix", async () => {
      const findOne = jest
        .spyOn(Image, "findOne")
        .mockResolvedValue({ company_name: "openlogo.png" });

      const result = await repository.fetchImage("openlogo");

      expect(findOne).toHaveBeenCalledWith({
        company_name: { $regex: "^openlogo(\\.|$)", $options: "i" },
        $or: [{ is_published: true }, { is_published: { $exists: false } }],
      });
      expect(result).toEqual({ company_name: "openlogo.png" });
    });
  });

  describe("fetchCompanyList", () => {
    it("returns published images matching the pattern", async () => {
      const find = jest.spyOn(Image, "find").mockResolvedValue([]);

      const result = await repository.fetchCompanyList(/^open/i);

      expect(find).toHaveBeenCalledWith({
        company_name: { $regex: /^open/i },
        $or: [{ is_published: true }, { is_published: { $exists: false } }],
      });
      expect(result).toEqual([]);
    });
  });

  describe("fetchCloudFrontURL", () => {
    it("signs the image path", async () => {
      cloudFrontSignedURL.mockReturnValue({
        data: "https://cdn/openlogo.png?signed",
        success: true,
      });

      const result = await repository.fetchCloudFrontURL("png/openlogo.png");

      expect(cloudFrontSignedURL).toHaveBeenCalledWith("/png/openlogo.png");
      expect(result).toBe("https://cdn/openlogo.png?signed");
    });
  });

  describe("getAllImages", () => {
    it("paginates the images and attaches signed urls", async () => {
      jest.spyOn(repository.model, "countDocuments").mockResolvedValue(5);
      const query = createQueryMock([createImageDoc("openlogo", "png")]);
      const find = jest.spyOn(repository.model, "find").mockReturnValue(query);
      cloudFrontSignedURL.mockReturnValue({
        data: "https://cdn/openlogo.png?signed",
        success: true,
      });

      const result = await repository.getAllImages(2, 2);

      expect(find).toHaveBeenCalledWith({});
      expect(query.skip).toHaveBeenCalledWith(2);
      expect(query.limit).toHaveBeenCalledWith(2);
      expect(query.sort).toHaveBeenCalledWith({ updated_at: -1 });
      expect(cloudFrontSignedURL).toHaveBeenCalledWith("/png/openlogo.png");
      expect(result).toEqual({
        data: [
          {
            company_name: "openlogo",
            extension: "png",
            imageUrl: "https://cdn/openlogo.png?signed",
          },
        ],
        total: 5,
        currentPage: 2,
        totalPages: 3,
      });
    });

    it("filters by a case-insensitive company name search", async () => {
      jest.spyOn(repository.model, "countDocuments").mockResolvedValue(0);
      jest.spyOn(repository.model, "find").mockReturnValue(createQueryMock([]));

      await repository.getAllImages(0, 10, "logo");

      expect(repository.model.countDocuments).toHaveBeenCalledWith({
        company_name: { $regex: "logo", $options: "i" },
      });
    });

    it("returns a null url when signing fails", async () => {
      jest.spyOn(repository.model, "countDocuments").mockResolvedValue(1);
      jest
        .spyOn(repository.model, "find")
        .mockReturnValue(createQueryMock([createImageDoc("openlogo", "svg")]));
      cloudFrontSignedURL.mockReturnValue({ success: false });

      const result = await repository.getAllImages(0, 10);

      expect(result.data[0].imageUrl).toBeNull();
    });
  });

  describe("getImagesCount", () => {
    it("counts all images", async () => {
      const countDocuments = jest
        .spyOn(Image, "countDocuments")
        .mockResolvedValue(12);

      const result = await repository.getImagesCount();

      expect(countDocuments).toHaveBeenCalledWith();
      expect(result).toBe(12);
    });
  });

  describe("invalidateCloudFrontCache", () => {
    it("invalidates the absolute image path", async () => {
      cloudFrontInvalidate.mockResolvedValue({});

      await repository.invalidateCloudFrontCache("png/openlogo.png");

      expect(cloudFrontInvalidate).toHaveBeenCalledWith(["/png/openlogo.png"]);
    });
  });
});
