const { STATUS_CODES } = require("http");

const errorHandler = (err, _req, res, _next) => {
  return res.status(500).json({
    error: STATUS_CODES[500],
    message: err.message,
    statusCode: 500,
  });
};

module.exports = errorHandler;
