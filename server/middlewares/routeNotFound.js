const { STATUS_CODES } = require("http");

const routeNotFound = (_req, res, next) => {
  res
    .status(404)
    .json({
      statusCode: 404,
      message: "route not found",
      error: STATUS_CODES[404],
    });
  next();
};

module.exports = routeNotFound;
