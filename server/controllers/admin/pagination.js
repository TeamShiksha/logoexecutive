const { fetchUserFromId, getImagesByUserIdLimitedByQuery } = require("../../services");
const { STATUS_CODES } = require("http");

const getImagesByQueryController = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const user = await fetchUserFromId(userId);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: "User document not found",
      });
    }

    const { images, totalCount } = await getImagesByUserIdLimitedByQuery(userId, page, limit);
    if (!images || images.length === 0) {
      return res.status(200).json({
        statusCode: 200,
        data: [],
        totalCount: 0,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: images,
      totalCount: totalCount, // Total count of images
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getImagesByQueryController };
