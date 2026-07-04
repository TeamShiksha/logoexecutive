const BaseRepository = require("./base");
const Image = require("../models/images");

const {
  cloudFrontSignedURL,
  cloudFrontInvalidate,
} = require("../utils/cloudFront");

/**
 * The ImageRepository extends BaseRepository to manage ContactUs model operations, inheriting CRUD methods like getById, getAll, create, update, and delete..
 * It passes the Images model to the base repository for database interactions.
 *  Custom methods specific to Images can also be added as needed.
 */

class ImagesRepository extends BaseRepository {
  constructor() {
    super(Image);
  }

  /**
   * Fetches an image for a given company with a specified file extension.
   * @param {string} company - Name of the company.
   * @returns {Promise<Object|null>} - Image object if found, otherwise null.
   */
  async fetchImage(company) {
    const image = await Image.findOne({
      company_name: {
        $regex: `^${company}(\\.|$)`,
        $options: "i",
      },
      $or: [{ is_published: true }, { is_published: { $exists: false } }],
    });
    return image;
  }

  /**
   * Fetches a list of companies matching a specified regex pattern.
   * @param {RegExp} regexPattern - Regular expression to match company names.
   * @returns {Promise<Array<Object>>} - Array of company objects matching the pattern returns an empty array if no matches are found.
   */
  async fetchCompanyList(regexPattern) {
    const companyList = await Image.find({
      company_name: { $regex: regexPattern },
      $or: [{ is_published: true }, { is_published: { $exists: false } }],
    });
    return companyList;
  }

  /**
   * Generates a signed CloudFront URL for the given image URL.
   * @param {string} imageUrl - Path or identifier for the image.
   * @returns {Promise<string>} - Signed CloudFront URL.
   */
  async fetchCloudFrontURL(imageUrl) {
    const cloudFrontUrl = await cloudFrontSignedURL(`/${imageUrl}`).data;
    return cloudFrontUrl;
  }

  async getAllImages(skip, limit, search = "") {
    const query = {};

    if (search) {
      query.company_name = { $regex: search, $options: "i" };
    }

    const [total, images] = await Promise.all([
      this.model.countDocuments(query),
      this.model.find(query).skip(skip).limit(limit).sort({ updated_at: -1 }),
    ]);

    const imagesData = images.map((image) => {
      const imageData = image.data();
      const imagePath = `${image.extension}/${image.company_name}.${image.extension}`;
      const signedUrlResult = cloudFrontSignedURL(`/${imagePath}`);
      imageData.imageUrl = signedUrlResult.success
        ? signedUrlResult.data
        : null;
      return imageData;
    });

    return {
      data: imagesData,
      total,
      currentPage: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }
  async getImagesCount() {
    return await Image.countDocuments();
  }

  /**
   * Invalidates the CloudFront cache for the specified image path.
   *
   * @param {string} imageUrl - The relative path of the image to invalidate.
   * @returns {Promise<void>} Resolves when the cache invalidation request is completed.
   */
  async invalidateCloudFrontCache(imageUrl) {
    const paths = [`/${imageUrl}`];
    await cloudFrontInvalidate(paths);
  }
}

module.exports = ImagesRepository;
