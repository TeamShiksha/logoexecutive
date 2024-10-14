const Log = require("../models/Log");
const { fetchUserByEmail } = require("./Users");

/**
 * Creates log report in the DB
 * @param {string} message - error or info message 
 * @param {Object} req - http request Object
 * @param {string} status - status of log, whether it info or error
 */

const log = async (message, req, status) => {
  const currentUser = await fetchUserByEmail(req.body.email);
  const request = `${req.method} ${req.url}`;
  try {
    const logEntry = new Log({
      log_message: message,
      request_ip: req.ip,
      host: req.get("host"),
      status: status,
      user: currentUser?._id,
      request,
    });
    await logEntry.save();
  } catch (err) {
    console.error("Error logging to MongoDB:", err.message);
  }
};

module.exports = { log };
