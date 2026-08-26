const { STATUS_CODES } = require("node:http");
const mongoose = require("mongoose");
const { Messages, getIsProduction } = require("../utils/constants");

/**
 * Derives the HTTP status code an error should be reported with.
 * @param {Error} err - The error forwarded to the handler.
 * @returns {number} - HTTP status code.
 */
function resolveStatusCode(err) {
  if (err instanceof mongoose.Error.ValidationError) return 400;
  if (err instanceof mongoose.Error.CastError) return 400;
  if (err.type === "entity.parse.failed") return 400;
  if (err.message === "Not allowed by CORS") return 403;

  const status = Number(err.statusCode || err.status);
  if (Number.isInteger(status) && status >= 400 && status <= 599) {
    return status;
  }
  return 500;
}

/**
 * Centralized Express error handler.
 * Logs every error forwarded through `next(err)` with request context and
 * responds with the JSON envelope used across the API. Internal error details
 * are never sent to clients for 5xx responses.
 *
 * @param {Error} err - The error forwarded to the handler.
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 * @param {import("express").NextFunction} next - Express next function.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = resolveStatusCode(err);

  console.error(
    `[error] ${req.method} ${req.originalUrl} -> ${statusCode}: ${err?.message}`,
    getIsProduction() ? "" : err?.stack || ""
  );

  if (res.headersSent) {
    return res.end();
  }

  const isServerError = statusCode >= 500;
  return res.status(statusCode).json({
    statusCode,
    error: STATUS_CODES[statusCode] || STATUS_CODES[500],
    message: isServerError
      ? Messages.SOMETHING_WENT_WRONG
      : err.message || STATUS_CODES[statusCode],
  });
}

/**
 * Handles requests that matched no route with the API JSON envelope.
 *
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 */
function notFoundHandler(req, res) {
  return res.status(404).json({
    statusCode: 404,
    error: STATUS_CODES[404],
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
