const { STATUS_CODES } = require("node:http");
const {
  ImageService,
  RequestService,
  CreateLogoRequestService,
} = require("../services");
const {
  Messages,
  ExtractCompanyNameFromUrlRegex,
} = require("../utils/constants");
const {
  companyUrlSchema,
  imageExtensionSchema,
} = require("../schemas/catalog");
const {
  updateRequestSchema,
  requestQuerySchema,
} = require("../schemas/request");

/**
 * Validates input, checks for existing requests, creates image data, and adds a new logo request.
 */
async function newLogoRequestController(req, res, next) {
  try {
    const { createLogoRequestService, imageService, requestService } = {
      createLogoRequestService: new CreateLogoRequestService(),
      imageService: new ImageService(),
      requestService: new RequestService(),
    };
    const { userId } = req.userData;
    const { size: imageSize, companyUrl, extension } = req.body;

    const { error } = companyUrlSchema.validate(companyUrl);

    if (error) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        statusCode: 500,
        message: error.message,
      });
    }

    const { error: extensionError, value: safeExtension } =
      imageExtensionSchema.validate(extension);
    if (extensionError) {
      return res.status(422).json({
        error: STATUS_CODES[422],
        statusCode: 422,
        message: extensionError.message,
      });
    }

    const match = companyUrl
      .toUpperCase()
      .match(ExtractCompanyNameFromUrlRegex);
    const companyName = match[1];

    const imageExist = await imageService.getImageByCompanyName(companyName);
    if (imageExist) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        statusCode: 400,
        message: Messages.IMAGE_ALREADY_EXISTS,
      });
    }

    const logoAlreadyRequested =
      await requestService.requestExistsForCompanyUrl(companyUrl);
    if (logoAlreadyRequested) {
      return res.status(400).json({
        message: Messages.COMPANY_URL_ALREADY_PENDING,
        statusCode: 400,
        error: STATUS_CODES[400],
      });
    }

    const logoHasPendingRequest =
      await createLogoRequestService.findPendingRequestByCompanyUrl(companyUrl);
    if (logoHasPendingRequest) {
      return res.status(400).json({
        message: Messages.LOGO_ALREADY_CREATED_AND_PENDING,
        statusCode: 400,
        error: STATUS_CODES[400],
      });
    }

    const imageData = await imageService.createImageData(
      userId,
      imageSize,
      companyName,
      companyUrl,
      safeExtension,
      false
    );
    if (!imageData) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        statusCode: 500,
        message: Messages.UPDATE_IMAGE_FAILED,
      });
    }

    const createLogoData = await createLogoRequestService.addLogoData(
      userId,
      companyUrl,
      imageData._id
    );
    res.status(200).json({
      statusCode: 200,
      message: Messages.UPLOAD_SUCCESS,
      data: createLogoData,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Validates input, updates logo request status, and manages image visibility based on approval or rejection.
 */
async function updateLogoRequestController(req, res, next) {
  try {
    const createLogoRequestService = new CreateLogoRequestService();
    const { createLogoId } = req.params;

    const { error, value } = updateRequestSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        statusCode: 422,
        error: STATUS_CODES[422],
        message: error.message,
      });
    }
    const { status, comment } = value;
    const { userId: operatorId } = req.userData;

    const createdLogo =
      await createLogoRequestService.getLogoById(createLogoId);
    if (!createdLogo) {
      return res.status(404).json({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: Messages.CREATED_LOGO_NOT_FOUND,
      });
    }

    const updateCreatedLogo = await createLogoRequestService.respondToLogo(
      createLogoId,
      operatorId,
      status,
      comment
    );

    if (updateCreatedLogo?.alreadyProcessed) {
      return res.status(409).json({
        statusCode: 409,
        error: STATUS_CODES[409],
        message: Messages.LOGO_REQUEST_ALREADY_PROCESSED,
      });
    }

    const updatedLogoData = {
      companyUrl: createdLogo.companyUrl,
      status: status,
      comment: comment,
      openedAt: createdLogo.openedAt,
    };

    return res.status(200).json({
      statusCode: 200,
      message: Messages.UPDATE_SUCCESS,
      data: updatedLogoData,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Validates input, fetches list of created logo, and returns paginated results.
 */
async function getLogoRequestController(req, res, next) {
  try {
    const createLogoRequestService = new CreateLogoRequestService();
    const { error, value } = requestQuerySchema.validate(req.query);
    if (error) {
      return res.status(422).json({
        statusCode: 422,
        error: STATUS_CODES[422],
        message: error.message,
      });
    }

    const { page, limit, tab } = value;
    const { data, total, currentPage, totalPages } =
      await createLogoRequestService.getPaginatedCreateLogos(
        Number.parseInt(page),
        Number.parseInt(limit),
        tab
      );

    const fetchedData = !data || data.length === 0 ? [] : data;

    const resultsWithPreview = await Promise.all(
      fetchedData.map(async (item) => {
        const detail = await createLogoRequestService.getLogoDetails(item._id);
        return { ...item._doc, previewUrl: detail?.previewUrl || null };
      })
    );

    return res.status(200).json({
      statusCode: 200,
      message: Messages.FETCH_ALL_REQUESTS,
      total,
      currentPage,
      totalPages,
      results: resultsWithPreview,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  newLogoRequestController,
  updateLogoRequestController,
  getLogoRequestController,
};
