const { STATUS_CODES } = require("http");
const {
  UserService,
  ImageService,
  KeyService,
  RequestService,
  SubscriptionService,
  ContactUsService,
} = require("../services");
const { addAdminSchema, imageReuploadSchema } = require("../schemas/admin");
const {
  companyUrlSchema,
  imageExtensionSchema,
} = require("../schemas/catalog");
const {
  Messages,
  ExtractCompanyNameFromUrlRegex,
  UserType,
} = require("../utils/constants");
const { default: mongoose } = require("mongoose");
const { grabCompanyLogos } = require("../utils/webLogoSearch.js");

async function getAnalyticsController(req, res, next) {
  try {
    const userService = new UserService();
    const totalUsers = await userService.getUsersCount();
    const keyService = new KeyService();
    const totalKeys = await keyService.getKeysCount();
    const requestService = new RequestService();
    const contactUsService = new ContactUsService();
    const totalContactUs = await contactUsService.getFormsCount();
    const totalRequests = await requestService.getRequestsCount();
    const subscriptionService = new SubscriptionService();
    const totalHits = await subscriptionService.getSubscriptionUsageCount();
    const imageService = new ImageService();
    const totalImages = await imageService.getImagesCount();

    return res.status(200).json({
      statusCode: 200,
      data: [
        {
          title: "Users",
          value: totalUsers,
        },
        {
          title: "Keys",
          value: totalKeys,
        },

        {
          title: "Requests",
          value: totalRequests + totalContactUs,
        },
        {
          title: "Hits",
          value: totalHits,
        },
        {
          title: "Images",
          value: totalImages,
        },
      ],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Promotes a user to admin or operator role using their email.
 * Validates email input and updates user role if the user exists.
 */
async function addPermissionController(req, res, next) {
  try {
    const userService = new UserService();
    const email = req.body.email;
    const { userId, role } = req.params;

    const { error } = addAdminSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        statusCode: 422,
        message: error.message,
        error: STATUS_CODES[422],
      });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        statusCode: 400,
        message: Messages.INVALID_USER_ID,
        error: STATUS_CODES[400],
      });
    }

    const validRole = [UserType.ADMIN, UserType.OPERATOR];
    if (!validRole.includes(role.toUpperCase())) {
      return res.status(400).json({
        statusCode: 400,
        message: Messages.UNSUPPORTED_ROLE,
        error: STATUS_CODES[400],
      });
    }

    const user = await userService.getUser(userId);
    if (user == null) {
      return res.status(404).json({
        statusCode: 404,
        message: Messages.USER_NOT_FOUND,
        error: STATUS_CODES[404],
      });
    }
    const response = await userService.updateUserToAdmin(email);
    if (!response) {
      return res.status(404).json({
        statusCode: 404,
        message: Messages.USER_NOT_FOUND,
        error: STATUS_CODES[404],
      });
    }

    return res.status(200).json({
      statusCode: 200,
    });
  } catch (err) {
    next(err);
  }
}

/** Handles presignedUrl & faciliate with uploading images on AWS s3 bucket. */
async function getPreSignedController(req, res, next) {
  try {
    const imageService = new ImageService();
    const { companyUri, extension, type } = req.body;
    const { error } = companyUrlSchema.validate(companyUri);

    if (error) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        statusCode: 400,
        message: error.message,
      });
    }

    const { error: extensionError, value: safeExtension } =
      imageExtensionSchema.validate(extension);

    if (extensionError) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        statusCode: 400,
        message: extensionError.message,
      });
    }

    const match = companyUri
      .toUpperCase()
      .match(ExtractCompanyNameFromUrlRegex);

    const companyName = match[1];

    const imageExist = await imageService.getImageByCompanyName(companyName);

    if (type === "upload" && imageExist) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        statusCode: 400,
        message: Messages.IMAGE_ALREADY_EXISTS,
      });
    }

    if (type === "update" && !imageExist) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        statusCode: 400,
        message: Messages.IMAGE_NOT_EXIST,
      });
    }

    const { key, presignedUrl } = await imageService.getPreSignedUrl(
      companyName,
      safeExtension
    );

    if (!key || !presignedUrl) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        statusCode: 500,
        message: Messages.UPLOAD_FAILED,
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: { key, presignedUrl },
      message: Messages.UPLOAD_SUCCESS,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves the list of images uploaded by a specific user.
 * Validates the user existence and fetches associated images from the database.
 * Returns an empty array if no images are found.
 */
async function getCatalogController(req, res, next) {
  try {
    const userService = new UserService();
    const imageService = new ImageService();
    const { userId } = req.userData;
    const user = await userService.getUser(userId);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: Messages.USER_NOT_FOUND,
      });
    }

    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const search = req.query.search || "";
    const imageData = await imageService.getImages(skip, limit, search);

    if (user.role === UserType.OPERATOR) {
      if (imageData.data.length > 0) {
        return res.status(200).json({
          statusCode: 200,
          data: {
            imagesExist: true,
            images: [],
          },
          source: "db-search",
        });
      }
    }
    if (search && imageData?.data?.length === 0) {
      try {
        const webSearchResult = await grabCompanyLogos(search);
        if (webSearchResult?.logos?.length > 0) {
          const logoOptions = webSearchResult?.logos?.map((logo) => ({
            companyName: logo.companyName,
            url: logo.url,
            companyUri: logo.companyUri,
            extension: logo.extension,
            size: logo.size,
            bufferBase64: logo.bufferBase64 || "",
            mimeType: logo.mimeType || "",
          }));
          return res.status(200).json({
            statusCode: 200,
            data: logoOptions,
            source: "web-search",
          });
        }
        return res.status(404).json({
          message: Messages.LOGO_NOT_FOUND,
          statusCode: 404,
          error: STATUS_CODES[404],
        });
      } catch (error) {
        console.error("Failed to fetch logos from external source", error);
        return res.status(502).json({
          statusCode: 502,
          message: "Failed to fetch logos from external source",
          error: STATUS_CODES[502],
        });
      }
    }
    return res.status(200).json({
      statusCode: 200,
      data: imageData,
      source: "db-search",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an existing catalog image for admin users.
 * Validates the input, uploads the updated image to S3,
 * updates the image record in the database, and
 * invalidates the CloudFront cache on successful update.
 *
 */
async function updateCatalogController(req, res, next) {
  try {
    const imageServices = new ImageService();
    const { userId } = req.userData;
    const { id, companyUri, extension, size } = req.body;
    const imageSize = size;

    const { error } = imageReuploadSchema.validate({ id });
    if (error) {
      return res.status(422).json({
        statusCode: 422,
        message: error.details[0].message,
        error: STATUS_CODES[422],
      });
    }

    const previousImageData = await imageServices.getImageById(id);
    if (!previousImageData) {
      return res.status(404).json({
        error: STATUS_CODES[404],
        statusCode: 404,
        message: Messages.IMAGE_NOT_EXIST,
      });
    }

    const { error: extensionError, value: safeExtension } =
      imageExtensionSchema.validate(extension);
    if (extensionError) {
      return res.status(422).json({
        statusCode: 422,
        message: extensionError.message,
        error: STATUS_CODES[422],
      });
    }

    const match = companyUri
      .toUpperCase()
      .match(ExtractCompanyNameFromUrlRegex);
    const companyName = match[1];
    const Extension = safeExtension;

    const imageData = await imageServices.updateImageById(id, {
      uploadedBy: userId,
      updatedAt: Date.now(),
      imageSize,
      companyName,
      Extension,
    });
    if (!imageData) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        statusCode: 500,
        message: Messages.UPDATE_IMAGE_FAILED,
      });
    }

    await imageServices.invalidateCloudFrontCache(previousImageData);

    res.status(200).json({
      statusCode: 200,
      message: Messages.UPLOAD_SUCCESS,
      data: imageData,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handles metadata of file in the database.
 * Extracts `userId` and file details, processes and uploads file.
 */
async function addCatalogController(req, res, next) {
  try {
    const imageServices = new ImageService();
    const { userId } = req.userData;
    const imageSize = req.body.size;
    const companyUri = req.body.companyUri;
    const { error } = companyUrlSchema.validate(companyUri);

    if (error) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        statusCode: 500,
        message: error.message,
      });
    }

    const { error: extensionError, value: Extension } =
      imageExtensionSchema.validate(req.body.extension);
    if (extensionError) {
      return res.status(422).json({
        error: STATUS_CODES[422],
        statusCode: 422,
        message: extensionError.message,
      });
    }

    const match = companyUri
      .toUpperCase()
      .match(ExtractCompanyNameFromUrlRegex);
    const companyName = match[1];

    const imageExist = await imageServices.getImageByCompanyName(companyName);
    if (imageExist) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        statusCode: 400,
        message: Messages.IMAGE_ALREADY_EXISTS,
      });
    }

    const imageData = await imageServices.createImageData(
      userId,
      imageSize,
      companyName,
      companyUri,
      Extension
    );
    if (!imageData) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        statusCode: 500,
        message: Messages.UPDATE_IMAGE_FAILED,
      });
    }
    res.status(200).json({
      statusCode: 200,
      message: Messages.UPLOAD_SUCCESS,
      data: imageData,
    });
  } catch (err) {
    next(err);
  }
}
module.exports = {
  addPermissionController,
  getCatalogController,
  updateCatalogController,
  addCatalogController,
  getAnalyticsController,
  getPreSignedController,
};
