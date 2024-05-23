const { fetchUserFromId, getImagesByUserId } = require("../../services");
const { STATUS_CODES } = require("http");

const getImagesController = async (req, res, next) => {
  try {
    const { userId } = req.userData;
    const user = await fetchUserFromId(userId);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: "User document not found",
      });
    }
    const imageData = await getImagesByUserId(userId);
    if (!imageData)
      return res.status(200).json({
        statusCode: 200,
        data: [],
      });

    return res.status(200).json({
      statusCode: 200,
      data: imageData,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getImagesController };
