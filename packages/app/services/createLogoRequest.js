const CreateLogoRequestRepository = require("../repositories/createLogoRequest");
const { ImagesRepository, RewardsRepository } = require("../repositories");
const { StatusTypes } = require("../utils/constants");

class CreateLogoRequestService {
  constructor() {
    this.createLogoRequestRepository = new CreateLogoRequestRepository();
    this.imagesRepository = new ImagesRepository();
    this.rewardsRepository = new RewardsRepository();
  }

  /**
   * Adds a new logo request to the database.
   * @param {string} uploadedBy - The ID of the user uploading the logo.
   * @param {string} companyUrl - The URL of the company for which the logo is being created.
   * @param {string} imageId - The ID of the image associated with the logo request.
   * @returns {Object} - An object containing the ID of the newly created logo request.
   */
  async addLogoData(uploadedBy, companyUrl, imageId) {
    const result = await this.createLogoRequestRepository.create({
      user_id: uploadedBy,
      companyUrl: companyUrl,
      images: imageId,
    });
    return {
      _id: result._id,
    };
  }

  /**
   * Checks if a Pending request exists for the given company Url.
   * @param {string} companyUrl - The URL of the company for which the logo is being created.
   * @returns {Object} - The matching request document or null if doesn't exist.
   */
  async findPendingRequestByCompanyUrl(companyUrl) {
    const request =
      await this.createLogoRequestRepository.findByCompanyUrlAndStatus(
        companyUrl,
        StatusTypes.PENDING
      );
    return request;
  }

  /** Updates the status and comment of a logo request, and manages image visibility based on approval or rejection.
   * @param {string} createLogoID - The ID of the created logo
   * @param {string} operatorId - The ID of the user resolving logo request
   * @param {string} status - The status for the logo provided by the operator
   * @param {string} comment - The commnet for the logo provided by the operator
   * @return {Object} - An object containing the updated logo Data or a flag if already replied
   */
  async respondToLogo(createLogoID, operatorId, status, comment) {
    const currentLogo =
      await this.createLogoRequestRepository.getById(createLogoID);

    if (!currentLogo) return null;

    if (
      currentLogo.status == StatusTypes.RESOLVED ||
      currentLogo.status == StatusTypes.REJECTED
    ) {
      return { alreadyProcessed: true };
    }

    const updatedData = {
      status,
      comment,
      operator: operatorId,
      closedAt: new Date(),
    };

    const result = await this.createLogoRequestRepository.updateLogoStatus(
      createLogoID,
      updatedData
    );
    if (result.modifiedCount === 0) throw new Error("MongoDB operation failed");

    // If approved, publish the associated image so it becomes visible publicly. Also created a reward object for tracking.
    if (status === StatusTypes.RESOLVED && currentLogo.images) {
      await Promise.all([
        this.imagesRepository.update(currentLogo.images, {
          is_published: true,
          updated_at: new Date(),
        }),
        this.rewardsRepository.findOrCreateByImageId(
          currentLogo.images,
          currentLogo.user_id
        ),
      ]);
    }

    if (status === StatusTypes.REJECTED && currentLogo.images) {
      await this.imagesRepository.update(currentLogo.images, {
        is_deleted: true,
        updated_at: new Date(),
      });
    }

    return result;
  }

  /**
   * Retrieves the details of a specific logo request, including the generated logo preview URL if available.
   * @param {string} createLogoId - The ID of the logo request to retrieve.
   * @returns {Object|null} - The logo request details or null if not found.
   */
  async getLogoDetails(createLogoId) {
    const createLogoRequest =
      await this.createLogoRequestRepository.getById(createLogoId);
    if (!createLogoRequest) return null;

    let previewUrl = null;
    if (createLogoRequest.images) {
      const image = await this.imagesRepository.getById(
        createLogoRequest.images
      );
      if (image) {
        const imagePath = `${image.extension}/${image.company_name}.${image.extension}`;
        previewUrl = await this.imagesRepository.fetchCloudFrontURL(imagePath);
      }
    }

    return {
      _id: createLogoRequest._id,
      previewUrl,
    };
  }

  /** Fetches list of created logo
   * @param {number} page - number of pages
   * @param {number} limit - number of requests per page
   * @param {string} tab - tab to filter by
   * @returns {Promise<Object>} returns a list of created logo or null if no logo exists
   */
  async getPaginatedCreateLogos(page, limit, tab) {
    return await this.createLogoRequestRepository.getAll(page, limit, tab);
  }

  /** Retrieves created logo by ID
   * @param {string} createLogoId - The ID of the logo request to retrieve.
   * @returns {Object|null} - The logo request details or null if not found.
   */
  async getLogoById(createLogoId) {
    return await this.createLogoRequestRepository.getById(createLogoId);
  }
}

module.exports = CreateLogoRequestService;
