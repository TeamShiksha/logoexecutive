const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { ImagesRepository } = require("../repositories");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { grabCompanyLogos } = require("../utils/webLogoSearch");

class ImageServices {
  constructor() {
    this.imageRepository = new ImagesRepository();
    this.s3 = new S3Client({
      region: process.env.BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
    });
    this.s3BucketKey = process.env.BUCKET_KEY;
  }

  /**
   * Fetch the CloudFront image URL for a given company.
   *
   * @param {string} companyName - The name of the company for which to fetch the image.
   * @param {string} [imageExtension="png"] - The image file extension (e.g., "png", "jpg"), default is "png".
   * @param {boolean} [checkDb=true] - Whether to check the database for image existence before returning the URL, default is true.
   * @returns {Promise<string|null>} A promise that resolves to the CloudFront URL of the image, or `null` if it does not exist in the database.
   */
  async fetchImageByCompanyFree(
    companyName,
    imageExtension = "png",
    checkDb = true
  ) {
    let domainName = companyName;
    if (checkDb) {
      const image = await this.imageRepository.fetchImage(domainName);
      if (!image) {
        const scrapedResults = await grabCompanyLogos(companyName, 1);
        if (scrapedResults.success && scrapedResults.logos.length > 0) {
          return scrapedResults.logos[0].url;
        }
        return null;
      }
      domainName = image.company_name;
    }

    const imageUrl = `${imageExtension}/${domainName}.${imageExtension}`;
    const cloudFrontUrl =
      await this.imageRepository.fetchCloudFrontURL(imageUrl);
    return cloudFrontUrl;
  }

  /**
   *  Fetches a list of companies matching a given regex pattern.
   * @param {string} regexPattern The regex pattern to match company names.
   * @returns {Promise<Object>} - List of matching companies.
   **/
  async fetchCompanyList(regexPattern) {
    const companyList =
      await this.imageRepository.fetchCompanyList(regexPattern);
    return companyList;
  }

  /**
   * Retrieves a list of companies with their signed image URLs.
   * @param {Array<Object>} companyList - List of companies with their domain names.
   * @returns {Promise<Array<Object>>} - List of objects containing company names and their signed image URLs.
   **/
  async getDataList(companyList) {
    const dataList = [];
    const results = await Promise.allSettled(
      companyList.map(async (company) => {
        const signedUrl = await this.fetchImageByCompanyFree(
          company?.company_name,
          company?.extension,
          false
        );
        return { company, signedUrl };
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.signedUrl) {
        const { company, signedUrl } = result.value;
        dataList.push({
          companyName: company.company_name.split(".")[0],
          image: signedUrl,
          extension: company.extension,
        });
      }
    }

    return dataList;
  }

  async getPreSignedUrl(imageName, extension) {
    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${this.s3BucketKey}/${extension}/${imageName}.${extension}`,
    };
    const presignedUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand(uploadParams),
      { expiresIn: 30 }
    );
    return {
      presignedUrl,
      key: `${this.s3BucketKey}/${extension}/${imageName}.${extension}`,
    };
  }

  async createImageData(
    uploadedBy,
    imageSize,
    companyName,
    companyUri,
    Extension,
    isPublished = true
  ) {
    const result = await this.imageRepository.create({
      user_id: uploadedBy,
      company_name: companyName,
      company_uri: companyUri,
      image_size: Number(imageSize),
      extension: Extension,
      is_published: isPublished,
    });
    return {
      _id: result._id,
      updatedAt: result.updated_at,
    };
  }

  /**
   * Updates an image document by its unique identifier.
   *
   * @async
   * @param {string} id - The unique identifier of the image to update.
   * @param {Object} updateObj - The fields and values to update in the image document.
   * @throws {Error} If the update operation fails.
   */
  async updateImageById(id, updateObj) {
    const updatingImage = await this.imageRepository.update(id, {
      user_id: updateObj.uploadedBy,
      image_size: Number(updateObj.imageSize),
      extension: updateObj.Extension,
      updated_at: updateObj.updatedAt,
    });
    return {
      _id: updatingImage._id,
      updatedAt: updatingImage.updatedAt,
    };
  }

  /**
   * Retrieves a paginated list of images for a specific user.
   *
   * @async
   * @param {string} userId - The unique identifier of the user whose images are to be retrieved.
   * @param {number} skip - The number of images to skip (for pagination).
   * @param {number} limit - The maximum number of images to return.
   * @throws {Error} If the retrieval operation fails.
   */
  async getImages(skip, limit, search = "") {
    return await this.imageRepository.getAllImages(skip, limit, search);
  }

  async getImagesCount() {
    return await this.imageRepository.getImagesCount();
  }

  async getImageById(id) {
    return await this.imageRepository.getById(id);
  }

  async getImageByCompanyName(companyName) {
    return await this.imageRepository.fetchImage(companyName);
  }

  /**
   * Invalidates the CloudFront cache for a specific image based on the provided image data.
   *
   * @param {Object} imageData - The image metadata.
   * @param {string} imageData.extension - File type (png, jpg, etc.) of the image.
   * @param {string} imageData.company_name - Company identifier used in the image name.
   * @returns {Promise<Object>} The CloudFront invalidation response.
   */
  async invalidateCloudFrontCache(imageData) {
    const imageUrl = `${imageData.extension}/${imageData.company_name}.${imageData.extension}`;
    return await this.imageRepository.invalidateCloudFrontCache(imageUrl);
  }
}

module.exports = ImageServices;
